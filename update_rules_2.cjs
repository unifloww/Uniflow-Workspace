const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

const newRules = `
    match /pageBlocks/{blockId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.creatorId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.creatorId);
    }
`;

if (!rules.includes('/pageBlocks/')) {
  rules = rules.replace(/  \}\n\}/, `${newRules}  }\n}`);
  fs.writeFileSync('firestore.rules', rules);
}
