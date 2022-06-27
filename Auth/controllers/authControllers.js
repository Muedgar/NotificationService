const User = require('../models/User');

const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = {email:'', password:''};

//incorrect email
if(err.message == 'incorrect email') {
    errors.email = 'that email is not registered';
}
//incorrect password
if(err.message == 'incorrect password') {
    errors.password = 'that password is incorrect';
}

    // duplicate error code
    if(err.code==11000) {
        errors.email = 'that email is already registered';
        return errors;
    }

    // validation errors
    if(err.message.includes('Please enter valid email')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}



const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({id},'net ninja secret', {expiresIn: maxAge});
}




module.exports.signup_post = async (req,res) => {
    const {email,password,tier} = req.body;
    try {
        const user = await User.create({email,password,tier});

        // after creating a new user
        // create a jwt and send it in a cookie
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
        res.status(201).json({user: user._id});
        // 
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json(errors);
    }
}

module.exports.login_post = async(req, res) => {
    const {email,password} = req.body;
    
    try {
        const user = await User.login(email, password);
        // after creating a new user
        // create a jwt and send it in a cookie
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
        res.status(200).json({user: {email: user.email,tier: user.tier}, status: 'user logged in'});
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({errors});
    }
}


module.exports.signup_get = (req, res) => {
    res.render('signup.ejs');
}

module.exports.login_get = (req, res) => {
    res.render('login.ejs');
}
