import Country from '../models/country.model.js';

export const addCountry = async (req, res, next) => {
  try {
    const country = new Country(req.body);
    await country.save();
    res.status(201).json(country);
  } catch (error) {
    next(error);
  }
};

export const getAllCountries = async (req, res, next) => {
  try {
    const countries = await Country.find();

    if (!countries) {
      return res
        .status(404)
        .json({ success: false, message: 'No countries found!' });
    }

    res.status(200).json(countries);
  } catch (error) {
    next(error);
  }
};

export const checkCountry = async (req, res, next) => {
  try {
    const { name, isEdit } = req.body;

    if (isEdit) {
      return res.status(200).json({ success: true });
    }

    const existingCountry = await Country.findOne({ name });

    if (existingCountry) {
      return res.status(200).json({ success: false });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const editCountry = async (req, res, next) => {
  try {
    const country = await Country.findById(req.params.id);

    if (country) {
      if (req.body.name && req.body.name !== country.name) {
        const existingCountry = await Country.findOne({ name: req.body.name });
        if (existingCountry) {
          return res
            .status(200)
            .json({ success: false, message: 'Country name already exists!' });
        }
      }
      const updatedCountry = await Country.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedCountry);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    await Country.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
