require('dotenv').config();
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const address_model = require('../models/addressModels'); // Fixed import

const SECRET_KEY = process.env.SECRET_KEY;

// Create a new address for the customer
const createAddress = async (req, res) => {
    try {
        const token = req.headers['token'];
        logger.info('Received token for address creation: ', { token });

        if (!token) {
            logger.warn('No token provided in request headers');
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verifying the token
        let verified_data;

        try {
            verified_data = jwt.verify(token, SECRET_KEY);
            logger.info('Token verified successfully', { userId: verified_data.id });
        } catch (err) {
            logger.error('Token verification failed', { error: err });
            if (err instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ success: false, message: 'Token has expired' });
            } else if (err instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ success: false, message: 'Invalid token' });
            } else {
                return res.status(401).json({ success: false, message: 'Token verification failed' });
            }
        }

        const customer_id = verified_data.id;
        const { tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number } = req.body;

        // Validate that required fields are provided
        if (!tag || !pincode || !line1 || !line2 || !location) {
            logger.warn('Missing required fields in address creation request');
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newCustomer = await address_model.createaddress(
            customer_id, tag, pincode, line1, line2, location, ship_to_name, ship_to_phone_number
        );

        logger.info('Address stored successfully for user', { userId: customer_id });
        return res.json({
            success: true,
            message: 'Address stored successfully',
            customer: newCustomer
        });
    } catch (err) {
        logger.error('Error during address storing', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};

// Get the default address for the customer
const getDefaultAddress = async (req, res) => {
    try {
        const token = req.headers['token'];
        if (!token) {
            logger.warn('No token provided for default address request');
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verifying the token
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
            logger.info('Token verified successfully for default address retrieval', { userEmail: decoded.email });
        } catch (err) {
            logger.error('Token verification failed', { error: err });
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const customer_email = decoded.email;
        const defaultAddress = await address_model.select_default_address(customer_email);

        logger.info('Default address retrieved successfully for user', { userEmail: customer_email });
        return res.json({
            success: true,
            message: 'Default address retrieved successfully',
            customer: defaultAddress
        });
    } catch (err) {
        logger.error('Error retrieving default address', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};

// Get all addresses for the user
const getAddressForUser = async (req, res) => {
    try {
        const token = req.headers['token'];
        if (!token) {
            logger.warn('No token provided for address retrieval');
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verifying the token
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
            logger.info('Token verified successfully for address retrieval', { userId: decoded.id });
        } catch (err) {
            logger.error('Token verification failed', { error: err });
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const customer_id = decoded.id;
        const result = await address_model.getAllAddresses(customer_id);

        logger.info('All addresses retrieved successfully for user', { userId: customer_id });
        return res.json({
            success: true,
            message: 'All addresses retrieved successfully',
            address: result
        });
    } catch (err) {
        logger.error('Error retrieving all addresses', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};

// Get selected address based on address_id
const getSelectedAddress = async (req, res) => {
    try {
        const { address_id } = req.query; // Access the address_id from query parameters
        logger.info('Fetching address by ID', { addressId: address_id });

        const result = await address_model.SelectAddress(address_id);

        logger.info('Address retrieved successfully', { addressId: address_id });
        return res.json({
            success: true,
            result
        });
    } catch (err) {
        logger.error('Error retrieving selected address', { error: err.message });
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createAddress,
    getDefaultAddress,
    getAddressForUser,
    getSelectedAddress
};
