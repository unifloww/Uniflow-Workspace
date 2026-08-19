const fs = require('fs');

let rules = fs.readFileSync('firestore.rules', 'utf8');

const newRules = `
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    match /orders/{orderId} {
      allow read: if true; 
      allow create: if true;
      allow update, delete: if isOwner(resource.data.userId);
    }
`;

rules = rules.replace(/  \}\n\}/, `${newRules}  }\n}`);

fs.writeFileSync('firestore.rules', rules);
