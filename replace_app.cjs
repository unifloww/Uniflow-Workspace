const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importsToAdd = `
import ProductsManager from './components/ProductsManager';
import OrdersManager from './components/OrdersManager';
import WalletManager from './components/WalletManager';
`;

code = code.replace(/import BioLinkBuilder from '\.\/components\/BioLinkBuilder';/, `import BioLinkBuilder from './components/BioLinkBuilder';\n${importsToAdd}`);

const routesToAdd = `
          ) : activeItem === 'products' ? (
            <ProductsManager />
          ) : activeItem === 'orders' ? (
            <OrdersManager />
          ) : activeItem === 'wallet' ? (
            <WalletManager />
`;

code = code.replace(/          \) : activeItem === 'biolink' \? \(/, `${routesToAdd}          ) : activeItem === 'biolink' ? (`);

fs.writeFileSync('src/App.tsx', code);
