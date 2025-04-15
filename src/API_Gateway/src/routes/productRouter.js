// src/routes/userRouter.js
const express = require('express');
const router = express.Router();
const { StatusCodes } = require('http-status-codes');
const ServiceClient = require('../services/serviceClient');

const productServiceClient = new ServiceClient('product_service');

const errorHandler = (error, res) => {
  console.error('Service Error:', error);
  const status = error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = error.response?.data?.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    error: error.message,
  });
};

router.get('/product/get-all', async (req, res) => {
  try {
    const response = await productServiceClient.get('/api/product/get-all', {
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get('/product/get-by-id/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const response = await productServiceClient.get(`/api/product/get-by-id/${id}`, {
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get('/product/get-sorted', async (req, res) => {
  try {
    const response = await productServiceClient.get('/api/product/get-sorted', {
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get('/category/get-all', async (req, res) => {
  try {
    const response = await productServiceClient.get('/api/category/get-all', {
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});


router.get('/category/get-by-id/:id', async (req, res) => {
  try {
    const {id} = req.params; 
    const response = await productServiceClient.get(`/api/category/get-by-id/${id}`, {
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});


router.get('/supplier/get-all', async (req, res) => {
  try {
    const response = await productServiceClient.get('/api/supplier/get-all', {
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});


router.get('/supplier/get-by-id/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const response = await productServiceClient.get(`/api/supplier/get-by-id/${id}`, {
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});


router.get('/inventory/get-all', async (req, res) => {
  try {
    const response = await productServiceClient.get('/api/inventory/get-all', {
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});


router.get('/inventory/get-by-id/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const response = await productServiceClient.get(`/api/inventory/get-by-id/${id}`, {
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});


router.post('/product/admin/create', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const response = await productServiceClient.postAuth(
      '/api/product/admin/create', 
      req.body, 
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});


router.post('/category/admin/create', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const response = await productServiceClient.postAuth(
      '/api/category/admin/create', 
      req.body, 
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});

router.post('/supplier/admin/create', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const response = await productServiceClient.postAuth(
      '/api/supplier/admin/create', 
      req.body, 
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});

router.post('/inventory/admin/create', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const response = await productServiceClient.postAuth(
      '/api/inventory/admin/create', 
      req.body, 
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});



router.put('/product/admin/update/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const productId = req.params.id;
    const response = await productServiceClient.putAuth(
      `/api/product/admin/update/${productId}`, 
      req.body, 
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway ',
      status: 'ERROR',
    });
  }
});



router.put('/category/admin/update/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const categoryId = req.params.id;
    const response = await productServiceClient.putAuth(
      `/api/category/admin/update/${categoryId}`, 
      req.body, 
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});


router.put('/supplier/admin/update/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const supplierId = req.params.id;
    const response = await productServiceClient.putAuth(
      `/api/supplier/admin/update/${supplierId}`, 
      req.body, 
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});

router.put('/inventory/admin/update/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const supplierId = req.params.id;
    const response = await productServiceClient.putAuth(
      `/api/inventory/admin/update/${supplierId}`, 
      req.body, 
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});

router.delete('/product/admin/delete/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const productId = req.params.id;
    const response = await productServiceClient.deleteAuth(
      `/api/product/admin/delete/${productId}`, 
      token,
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
})


router.delete('/category/admin/delete/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const categoryId = req.params.id;
    const response = await productServiceClient.deleteAuth(
      `/api/category/admin/delete/${categoryId}`, 
      token,
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
})

router.delete('/supplier/admin/delete/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const supplierId = req.params.id;
    const response = await productServiceClient.deleteAuth(
      `/api/supplier/admin/delete/${supplierId}`, 
      token,
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
})


router.delete('/inventory/admin/delete/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('token gateway', token);
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }

    const supplierId = req.params.id;
    const response = await productServiceClient.deleteAuth(
      `/api/inventory/admin/delete/${supplierId}`, 
      token,
      { Authorization: `Bearer ${token}` }, 
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling product service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
})





module.exports = router;
