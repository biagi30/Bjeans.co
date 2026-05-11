const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((detail) => detail.message).join(", ")
      });
    }

    req.body = value;
    next();
  };
}

function validateParams(paramName = "id") {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!value || !objectIdPattern.test(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} parameter`
      });
    }
    next();
  };
}

const checkoutSchema = Joi.object({
  cartId: Joi.string().pattern(objectIdPattern).required(),
  shippingAddress: Joi.string().allow("").default("")
});

const paymentUpdateSchema = Joi.object({
  paymentStatus: Joi.string().valid("unpaid", "paid", "refunded").required(),
  status: Joi.string().valid("waiting_payment", "processing", "done", "shipped").optional(),
  updatedBy: Joi.string().pattern(objectIdPattern).optional()
});

const userCreateSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "staff", "customer").optional(),
  phone: Joi.string().allow("").optional(),
  address: Joi.string().allow("").optional()
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid("admin", "staff", "customer").optional(),
  phone: Joi.string().allow("").optional(),
  address: Joi.string().allow("").optional()
}).min(1);

const productCreateSchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().required(),
  category: Joi.string().required(),
  type: Joi.string().valid("retail", "accessory").optional(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  sizeOptions: Joi.array().items(Joi.string()).optional(),
  shrinkageWarning: Joi.string().allow("").optional(),
  images: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().allow("").optional(),
  isActive: Joi.boolean().optional()
});

const productUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  sku: Joi.string().optional(),
  category: Joi.string().optional(),
  type: Joi.string().valid("retail", "accessory").optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().min(0).optional(),
  sizeOptions: Joi.array().items(Joi.string()).optional(),
  shrinkageWarning: Joi.string().allow("").optional(),
  images: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().allow("").optional(),
  isActive: Joi.boolean().optional()
}).min(1);

const materialCreateSchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().required(),
  type: Joi.string().valid("denim", "button", "rivet", "thread", "leather", "zipper", "other").required(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().min(0).optional(),
  color: Joi.string().allow("").optional(),
  weightOz: Joi.number().min(0).optional(),
  stretch: Joi.string().allow("").optional(),
  origin: Joi.string().allow("").optional(),
  images: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().optional()
});

const materialUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  sku: Joi.string().optional(),
  type: Joi.string().valid("denim", "button", "rivet", "thread", "leather", "zipper", "other").optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().min(0).optional(),
  color: Joi.string().allow("").optional(),
  weightOz: Joi.number().min(0).optional(),
  stretch: Joi.string().allow("").optional(),
  origin: Joi.string().allow("").optional(),
  images: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().optional()
}).min(1);

const customOptionCreateSchema = Joi.object({
  type: Joi.string().valid("fabric", "model", "detail", "wash", "fit", "other").required(),
  name: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  priceDelta: Joi.number().optional(),
  image: Joi.string().allow("").optional(),
  isActive: Joi.boolean().optional()
});

const customOptionUpdateSchema = Joi.object({
  type: Joi.string().valid("fabric", "model", "detail", "wash", "fit", "other").optional(),
  name: Joi.string().optional(),
  description: Joi.string().allow("").optional(),
  priceDelta: Joi.number().optional(),
  image: Joi.string().allow("").optional(),
  isActive: Joi.boolean().optional()
}).min(1);

const cartCreateSchema = Joi.object({
  user: Joi.string().pattern(objectIdPattern).required(),
  items: Joi.array().items(
    Joi.object({
      itemType: Joi.string().valid("retail", "custom").required(),
      product: Joi.string().pattern(objectIdPattern).optional().allow(null),
      quantity: Joi.number().min(1).required(),
      unitPrice: Joi.number().min(0).required(),
      totalPrice: Joi.number().min(0).required(),
      customSpec: Joi.object().optional().allow(null)
    })
  ).optional(),
  totalAmount: Joi.number().min(0).optional()
});

const cartUpdateSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      itemType: Joi.string().valid("retail", "custom").required(),
      product: Joi.string().pattern(objectIdPattern).optional().allow(null),
      quantity: Joi.number().min(1).required(),
      unitPrice: Joi.number().min(0).required(),
      totalPrice: Joi.number().min(0).required(),
      customSpec: Joi.object().optional().allow(null)
    })
  ).optional(),
  totalAmount: Joi.number().min(0).optional()
}).min(1);

const orderCreateSchema = Joi.object({
  orderNumber: Joi.string().required(),
  orderType: Joi.string().valid("unified", "retail", "custom").optional(),
  parentOrder: Joi.string().pattern(objectIdPattern).optional().allow(null),
  customer: Joi.string().pattern(objectIdPattern).required(),
  items: Joi.array().items(
    Joi.object({
      itemType: Joi.string().valid("retail", "custom").required(),
      product: Joi.string().pattern(objectIdPattern).optional().allow(null),
      name: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      unitPrice: Joi.number().min(0).required(),
      totalPrice: Joi.number().min(0).required(),
      customSpec: Joi.object().optional().allow(null)
    })
  ).min(1).required(),
  status: Joi.string().valid("waiting_payment", "processing", "done", "shipped").optional(),
  paymentStatus: Joi.string().valid("unpaid", "paid", "refunded").optional(),
  shippingAddress: Joi.string().allow("").optional(),
  totalAmount: Joi.number().min(0).required()
});

const orderUpdateSchema = Joi.object({
  status: Joi.string().valid("waiting_payment", "processing", "done", "shipped").optional(),
  paymentStatus: Joi.string().valid("unpaid", "paid", "refunded").optional(),
  shippingAddress: Joi.string().allow("").optional(),
  totalAmount: Joi.number().min(0).optional(),
  updatedBy: Joi.string().pattern(objectIdPattern).optional()
}).min(1);

const measurementCreateSchema = Joi.object({
  user: Joi.string().pattern(objectIdPattern).required(),
  waist: Joi.number().min(0).optional(),
  thigh: Joi.number().min(0).optional(),
  calf: Joi.number().min(0).optional(),
  inseam: Joi.number().min(0).optional(),
  notes: Joi.string().allow("").optional()
});

const measurementUpdateSchema = Joi.object({
  waist: Joi.number().min(0).optional(),
  thigh: Joi.number().min(0).optional(),
  calf: Joi.number().min(0).optional(),
  inseam: Joi.number().min(0).optional(),
  notes: Joi.string().allow("").optional()
}).min(1);

module.exports = {
  validateBody,
  validateParams,
  checkoutSchema,
  paymentUpdateSchema,
  userCreateSchema,
  userUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  materialCreateSchema,
  materialUpdateSchema,
  customOptionCreateSchema,
  customOptionUpdateSchema,
  cartCreateSchema,
  cartUpdateSchema,
  orderCreateSchema,
  orderUpdateSchema,
  measurementCreateSchema,
  measurementUpdateSchema
};
