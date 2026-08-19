const fs = require('fs');

let code = fs.readFileSync('src/components/BioLinkBuilder.tsx', 'utf8');

const firebaseImports = `
import { doc, writeBatch } from 'firebase/firestore';
import { initFirebase } from '../lib/firebase';
`;

code = code.replace(/import \{ QRCodeSVG \} from 'qrcode.react';/, `import { QRCodeSVG } from 'qrcode.react';\n${firebaseImports}`);

const stateAdditions = `
  const [isSavingBlocks, setIsSavingBlocks] = useState(false);
  const [blocksSaveStatus, setBlocksSaveStatus] = useState('');

  // Debounced Save for PageBlocks
  React.useEffect(() => {
    if (!editingId || formData.blocks.length === 0) return;
    
    setIsSavingBlocks(true);
    setBlocksSaveStatus('Menyimpan perubahan...');

    const timer = setTimeout(async () => {
      try {
        const { db } = await initFirebase();
        const batch = writeBatch(db);
        
        formData.blocks.forEach((block, index) => {
          const docRef = doc(db, 'pageBlocks', block.id);
          batch.set(docRef, {
            ...block,
            pageId: editingId,
            creatorId: user?.uid,
            position: index,
            visible: block.isActive !== false,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });
        
        await batch.commit();
        setIsSavingBlocks(false);
        setBlocksSaveStatus('Tersimpan otomatis');
        setTimeout(() => setBlocksSaveStatus(''), 2000);
      } catch (err) {
        setIsSavingBlocks(false);
        setBlocksSaveStatus('Gagal menyimpan');
        console.error(err);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [formData.blocks, editingId, user?.uid]);
`;

code = code.replace(/  const getBioUrl = \(username: string\) =>/g, `${stateAdditions}\n  const getBioUrl = (username: string) =>`);

// Show status in UI
const statusUI = `
          {blocksSaveStatus && (
            <span className={\`text-xs font-bold px-2 py-1 rounded \${isSavingBlocks ? 'bg-amber-100 text-amber-600' : blocksSaveStatus === 'Gagal menyimpan' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}\`}>
              {blocksSaveStatus}
            </span>
          )}
`;
code = code.replace(/<button onClick=\{saveLink\} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-600 transition-colors">/g, 
`${statusUI}\n          <button onClick={saveLink} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-600 transition-colors">`);

fs.writeFileSync('src/components/BioLinkBuilder.tsx', code);
