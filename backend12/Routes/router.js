import express from 'express';
import  {register, logIn, getAllUsers, getUserById, updateUser, deleteUser}  from '../Controllers/UserController.js';
import { verificarToken, esAdmin } from '../Middlewares/AuthMiddleware.js';
const router = express.Router();

router.get('/',(req,res) =>{
    res.send(
        '<h1>Ay mi madreee</h1>'
    )
});
//Usuarios
router.post('/api/register', register)
router.post('/api/login',logIn)

//Rutas solo para el usuario con sesion activa.
router.get('/api/getUser/:id', verificarToken, getUserById)
router.put('/api/updateUser/:id', verificarToken, updateUser)

//Rutas solo para admin.
router.get('/api/getAllUsers', verificarToken, esAdmin, getAllUsers)
router.delete('/api/deleteUser/:id',verificarToken, deleteUser)


export default router; 