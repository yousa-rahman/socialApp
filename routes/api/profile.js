const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile')
const User = require('../../models/User')

router.get('/me', [auth], async(req, res) => {
  try{
    const profile = await  Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);

    if(!profile){
      return res.send({ msg: 'There is no profile for this user'});
    }

    res.send(profile);

  }catch(error){
    console.log(error.message);
    res.status(500).send({msg:'Server Error'});
  }
});

router.post('/', [auth, [
  check('status','Status is required').not().isEmpty(),
  check('skills','Skills are required').not().isEmpty(),
]],
async(req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
  }
  
    const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  } = req.body;

  const profileFields = {};

  profileFields.user = req.user.id;
  if (company) profileFields.company = company; 
  if (website) profileFields.website = website; 
  if (location) profileFields.location = location; 
  if (bio) profileFields.bio = bio; 
  if (status) profileFields.status = status; 
  if (githubusername) profileFields.githubusername = githubusername; 
  if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim()); 
  
  profileFields.social = {};
  if (youtube) profileFields.social.youtube = youtube; 
  if (twitter) profileFields.social.twitter = twitter; 
  if (linkedin) profileFields.social.linkedin = linkedin; 
  if (instagram) profileFields.social.instagram = instagram; 
  if (facebook) profileFields.social.facebook = facebook; 
  
 
  try {
    let profile = await Profile.findOne({user: req.user.id});

    if(profile){
      profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, { new: true});

      return res.json(profile);
    }

    profile = new Profile(profileFields);

    await profile.save();

    return res.json(profile);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', [auth], async(req, res) => {
  try{
    const profiles = await  Profile.find().populate('user',['name','avatar']);

    if(!profiles){
      return res.send({ msg: 'There is are no profiles'});
    }

    res.json(profiles);

  }catch(error){
    console.log(error.message);
    res.status(500).send({msg:'Server Error'});
  }
});

router.get('/user/:user_id', auth, async(req, res) => {
  try{
    const profile = await  Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar']);

    if(!profile){
      return res.send({ msg: 'Profile not Found'});
    }

    res.json(profile);

  }catch(error){
    console.log(error.message);
    if(error.kind == 'ObjectId'){
      return res.send({ msg: 'Profile not Found'}); 
    }
    res.status(500).send({msg:'Server Error'});
  }
});

router.delete('/', auth, async(req, res) => {
  try{
    await  Profile.findOneAndRemove({user: req.user.id});
    await  User.findOneAndRemove({user: req.user.id});

    res.json({msg: 'User Deleted'});

  }catch(error){
    console.log(error.message);
    if(error.kind == 'ObjectId'){
      return res.send({ msg: 'Profile not Found'}); 
    }
    res.status(500).send({msg:'Server Error'});
  }
});

module.exports = router;