// Run in mongosh against the target cluster.
// Example: mongosh "mongodb+srv://<user>:<pass>@cluster" --file mongodb-schema-validation.js

const dbName = "bjeans";
const database = db.getSiblingDB(dbName);

function applyValidator(collection, validator) {
  database.runCommand({
    collMod: collection,
    validator,
    validationLevel: "moderate",
    validationAction: "error"
  });
}

applyValidator("materials", {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "sku", "type", "price", "stock", "isActive"],
    properties: {
      name: { bsonType: "string" },
      sku: { bsonType: "string" },
      type: { bsonType: "string" },
      price: { bsonType: "number", minimum: 0 },
      stock: { bsonType: "number", minimum: 0 },
      color: { bsonType: "string" },
      weightOz: { bsonType: "number", minimum: 0 },
      stretch: { bsonType: "string" },
      origin: { bsonType: "string" },
      images: { bsonType: "array", items: { bsonType: "string" } },
      isActive: { bsonType: "bool" }
    }
  }
});

applyValidator("products", {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "sku", "category", "type", "price", "stock", "isActive"],
    properties: {
      name: { bsonType: "string" },
      sku: { bsonType: "string" },
      category: { bsonType: "string" },
      type: { bsonType: "string" },
      price: { bsonType: "number", minimum: 0 },
      stock: { bsonType: "number", minimum: 0 },
      sizeOptions: { bsonType: "array", items: { bsonType: "string" } },
      shrinkageWarning: { bsonType: "string" },
      images: { bsonType: "array", items: { bsonType: "string" } },
      description: { bsonType: "string" },
      isActive: { bsonType: "bool" }
    }
  }
});

applyValidator("custom_options", {
  $jsonSchema: {
    bsonType: "object",
    required: ["type", "name", "priceDelta", "isActive"],
    properties: {
      type: { bsonType: "string" },
      name: { bsonType: "string" },
      description: { bsonType: "string" },
      priceDelta: { bsonType: "number" },
      image: { bsonType: "string" },
      isActive: { bsonType: "bool" }
    }
  }
});

applyValidator("custom_builder_presets", {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "items", "basePrice", "isActive"],
    properties: {
      name: { bsonType: "string" },
      items: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["type", "value"],
          properties: {
            type: { bsonType: "string" },
            value: { bsonType: "string" }
          }
        }
      },
      basePrice: { bsonType: "number", minimum: 0 },
      isActive: { bsonType: "bool" }
    }
  }
});

applyValidator("orders", {
  $jsonSchema: {
    bsonType: "object",
    required: ["orderNumber", "orderType", "customer", "items", "status", "paymentStatus", "totalAmount"],
    properties: {
      orderNumber: { bsonType: "string" },
      orderType: { bsonType: "string" },
      parentOrder: { bsonType: ["objectId", "null"] },
      customer: { bsonType: "objectId" },
      items: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["itemType", "name", "quantity", "unitPrice", "totalPrice"],
          properties: {
            itemType: { bsonType: "string" },
            product: { bsonType: ["objectId", "null"] },
            name: { bsonType: "string" },
            quantity: { bsonType: "number", minimum: 1 },
            unitPrice: { bsonType: "number", minimum: 0 },
            totalPrice: { bsonType: "number", minimum: 0 },
            customSpec: { bsonType: ["object", "null"] }
          }
        }
      },
      status: { bsonType: "string" },
      paymentStatus: { bsonType: "string" },
      shippingAddress: { bsonType: "string" },
      totalAmount: { bsonType: "number", minimum: 0 }
    }
  }
});

applyValidator("carts", {
  $jsonSchema: {
    bsonType: "object",
    required: ["user", "items", "totalAmount"],
    properties: {
      user: { bsonType: "objectId" },
      items: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["itemType", "quantity", "unitPrice", "totalPrice"],
          properties: {
            itemType: { bsonType: "string" },
            product: { bsonType: ["objectId", "null"] },
            quantity: { bsonType: "number", minimum: 1 },
            unitPrice: { bsonType: "number", minimum: 0 },
            totalPrice: { bsonType: "number", minimum: 0 },
            customSpec: { bsonType: ["object", "null"] }
          }
        }
      },
      totalAmount: { bsonType: "number", minimum: 0 }
    }
  }
});

applyValidator("measurementprofiles", {
  $jsonSchema: {
    bsonType: "object",
    required: ["user"],
    properties: {
      user: { bsonType: "objectId" },
      waist: { bsonType: "number", minimum: 0 },
      thigh: { bsonType: "number", minimum: 0 },
      calf: { bsonType: "number", minimum: 0 },
      inseam: { bsonType: "number", minimum: 0 },
      notes: { bsonType: "string" }
    }
  }
});
