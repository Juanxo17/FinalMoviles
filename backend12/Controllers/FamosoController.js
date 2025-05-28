import Famoso from "../models/Famoso.js";
import Ciudad from "../models/Ciudad.js";

export const createFamoso = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return res.status(400).json({ message: 'No tienes permisos para crear personas famosas' });
    }
    const { nombre, profesion, ciudad } = req.body;
    if (!nombre || !profesion || !ciudad) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    const ciudadDoc = await Ciudad.findOne({ nombre: ciudad });
    if (!ciudadDoc) {
      return res.status(404).json({ message: 'La ciudad especificada no existe' });
    }
    const nuevoFamoso = new Famoso({
      nombre,
      profesion,
      ciudad: ciudadDoc._id
    });
    await nuevoFamoso.save();
    res.status(201).json({ message: 'Famoso creado exitosamente', famoso: nuevoFamoso });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el famoso', error: error.message });
  }
};

export const getFamosos = async (req, res) => {
  try {
    const famosos = await Famoso.find().populate('ciudad');
    res.json(famosos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener famosos', error: error.message });
  }
};

export const getFamosoById = async (req, res) => {
  try {
    const { id } = req.params;
    const famoso = await Famoso.findById(id).populate('ciudad');
    if (!famoso) {
      return res.status(404).json({ message: 'Famoso no encontrado' });
    }
    res.json(famoso);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el famoso', error: error.message });
  }
};

export const updateFamoso = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return res.status(400).json({ message: 'No tienes permisos para actualizar famosos' });
    }
    const { id } = req.params;
    const { nombre, profesion, ciudad } = req.body;
    let ciudadDoc = null;
    if (ciudad) {
      ciudadDoc = await Ciudad.findOne({ nombre: ciudad });
      if (!ciudadDoc) {
        return res.status(404).json({ message: 'La ciudad especificada no existe' });
      }
    }
    const datosActualizados = {
      ...(nombre && { nombre }),
      ...(profesion && { profesion }),
      ...(ciudadDoc && { ciudad: ciudadDoc._id })
    };
    const famosoActualizado = await Famoso.findByIdAndUpdate(id, datosActualizados, { new: true });
    res.json(famosoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el famoso', error: error.message });
  }
};

export const deleteFamoso = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return res.status(400).json({ message: 'No tienes permisos para eliminar famosos' });
    }
    const { id } = req.params;
    await Famoso.findByIdAndDelete(id);
    res.json({ message: 'Famoso eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el famoso', error: error.message });
  }
};
