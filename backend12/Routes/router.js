import express from 'express';
import  {register, logIn}  from '../Controllers/UserController.js';
const router = express.Router();

router.get('/',(req,res) =>{
    res.send(
        '<h1>Ay mi madreee</h1>'
    )
});
//Usuarios
router.post('/api/register', register)
router.post('/api/login',logIn)

export default router; 