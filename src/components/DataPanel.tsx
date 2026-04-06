import { useRef, useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useStore, useToast } from '../context/useStore';
import { Button } from './shared/Button';
import { Modal } from './shared/Modal';

interface Props {
  onClose: () => void;
}

export function DataPanel({ onClose }: Props) {
  const { exportData, importData, habits, completions } = useStore();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState<string | null>(null); // holds pending json

  function handleExport() {
    exportData();
    showToast('Data exported successfully!');
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      // If there's existing data, ask for confirmation
      if (habits.length > 0 || completions.length > 0) {
        setConfirmOverwrite(json);
      } else {
        runImport(json);
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  }

  function runImport(json: string) {
    setImportError(null);
    setImportSuccess(false);
    const err = importData(json);
    if (err) {
      setImportError(err);
    } else {
      setImportSuccess(true);
      showToast('Data imported successfully!');
      setTimeout(onClose, 1200);
    }
    setConfirmOverwrite(null);
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-subtle)',
    marginBottom: 8,
  };

  const card: React.CSSProperties = {
    background: 'var(--bg-muted)',
    borderRadius: 14,
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  return (
    <Modal title="Data Management" onClose={onClose} width={440}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Summary */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Habits', value: habits.filter(h => !h.archivedAt).length },
            { label: 'Completions', value: completions.length },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1,
              background: 'var(--bg-muted)',
              borderRadius: 12,
              padding: '12px 16px',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{value}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Export */}
        <div>
          <p style={sectionLabel}>Export</p>
          <div style={card}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              Download all your habits and completion history as a JSON file. Use this to back up your data or migrate to another system.
            </p>
            <Button variant="primary" onClick={handleExport} style={{ alignSelf: 'flex-start' }}>
              <Download size={15} />
              Download JSON
            </Button>
          </div>
        </div>

        {/* Import */}
        <div>
          <p style={sectionLabel}>Import</p>
          <div style={card}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              Restore from a previously exported HabitBuilder JSON file. This will <strong style={{ color: 'var(--text)' }}>replace</strong> all current data.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Button variant="secondary" onClick={() => fileRef.current?.click()} style={{ alignSelf: 'flex-start' }}>
              <Upload size={15} />
              Choose JSON file
            </Button>

            {importError && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: '#ef4444', fontSize: 13, marginTop: 4 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                {importError}
              </div>
            )}
            {importSuccess && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#22c55e', fontSize: 13, marginTop: 4 }}>
                <CheckCircle size={15} />
                Import successful!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overwrite confirmation */}
      {confirmOverwrite && (
        <Modal title="Overwrite existing data?" onClose={() => setConfirmOverwrite(null)} width={380}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
            You already have <strong style={{ color: 'var(--text)' }}>{habits.length} habit{habits.length !== 1 ? 's' : ''}</strong> and{' '}
            <strong style={{ color: 'var(--text)' }}>{completions.length} completion{completions.length !== 1 ? 's' : ''}</strong>.
            Importing will replace everything. This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setConfirmOverwrite(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => runImport(confirmOverwrite)}>Yes, overwrite</Button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
