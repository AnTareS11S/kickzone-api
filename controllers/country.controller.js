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

export const checkCountryName = async (req, res, next) => {
  try {
    const { name, id } = req.query;

    const existingCountry = await Country.findOne({ name });
    if (existingCountry) {
      if (id && existingCountry._id.toString() === id) {
        res.status(200).json({ exists: false });
      } else {
        res.status(200).json({ exists: true });
      }
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    next(error);
  }
};

export const editCountry = async (req, res, next) => {
  try {
    const existedCountry = await Country.findById(req.params.id);

    if (!existedCountry) {
      return res
        .status(404)
        .json({ success: false, message: 'Country not found!' });
    }

    const updatedCountry = await Country.findByIdAndUpdate(
      { _id: req.params.id },
      { name: req.body.name },
      {
        new: true,
      }
    );

    res.status(200).json(updatedCountry);
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
