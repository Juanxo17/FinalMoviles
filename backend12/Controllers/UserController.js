import Usuario from "../models/Usuario.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


export const register = async (req, res)=>{
    try{
        const {nombre, email, password, rol} = req.body;
        const existeUsuario = await Usuario.findOne({email});
        if (existeUsuario){
            return res.status(400).json({
                error: 'El correo que estas ingresando ya esta asociado a un usuario, elige otro.'
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = new Usuario({
            nombre, 
            email,
            password: hashedPassword,
            rol 
        })

        await nuevoUsuario.save();

        res.status(201).json({
            _id: nuevoUsuario._id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol
        })

    }catch(error){
        res.status(400).json({
            message: 'error al registrar el usuario', error 
        });
    }
}

export const logIn = async (req, res) =>{
    try{
        const {email, password} = req.body;
        if (!email || !password){
            return res.status(400).json({
                error: 'No se enviaron todas las credenciales.'
            })
        }
        const usuario = await Usuario.findOne({email});
        if (!usuario){
            return res.status(400).json({
                error: 'No existe un usuario con tus credenciales, registrate primero.'
            })
        }
        const isMatch = await bcrypt.compare(password, usuario.password)
        if (!isMatch){
            return res.status(400).json({
                error: 'La contraseña no coincide, intenta de nuevo.'
            })
        }

        const token = jwt.sign(
        { id: usuario._id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(200).json({
            message: 'Has iniciado sesión satisfactoriamente.',
            token,
            id: usuario._id
        })

        

    }catch(error){
        return res.status(400).json({
            message: 'Error al iniciar sesión', error
        })
    }
}

