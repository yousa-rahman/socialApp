const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');

router.post('/',[
  check('name','Name is required').not().isEmpty(),
  check('email','Email is required').isEmail(),
  check('password','Password is required').isLength({min: 5}),
],
async(req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
  }

  const {name, email, password} = req.body;

  try {
    //CHECK THE USER EXISTANCE
    let user = await User.findOne({email});
    if(user){
      return res.status(400).json({errors:[{msg: 'User already exist'}]});
    }
  
    //GET USER AVATAR
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })
    user = new User({
      name,
      email,
      avatar,
      password
    })

    //HASH PASSWORD
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user:{
        id:user.id
      }
    }
    
    //RETURN JWT
    jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 360000}, (err, token)=> {
      if(err) throw err;
      res.json({token});
    });

    // res.send('User Successfully Registered')
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send({errors:[{msg: 'Server Error'}]});
  }
});

module.exports = router;