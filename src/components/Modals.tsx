import { CryptoAsset, ModalType, Transaction } from '@/types';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  activeModal: ModalType;
  onClose: () => void;
  onSaveSetup: (balance: number, limit: number) => void;
  onAddTransaction: (trans: Transaction) => void;
  onAddCrypto: (crypto: CryptoAsset) => void;
}

export const AppModals: React.FC<Props> = ({
  activeModal,
  onClose,
  onSaveSetup,
  onAddTransaction,
  onAddCrypto,
}) => {
  // Setup States
  const [inputBalance, setInputBalance] = useState('');
  const [inputLimit, setInputLimit] = useState('');

  // Transaction States
  const [transTitle, setTransTitle] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transType, setTransType] = useState<'inflow' | 'outflow'>('outflow');

  // Crypto States
  const [cryptoName, setCryptoName] = useState('');
  const [cryptoSymbol, setCryptoSymbol] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [cryptoPrice, setCryptoPrice] = useState('');

  return (
    <>
      {/* MODAL 1: SETUP SALDO & KUOTA */}
      <Modal visible={activeModal === 'setup'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pengaturan Kas Awal</Text>
            <Text style={styles.inputLabel}>Saldo Kas Rupiah Awal</Text>
            <TextInput style={styles.input} placeholder="Contoh: 2000000" keyboardType="numeric" value={inputBalance} onChangeText={setInputBalance} />
            <Text style={styles.inputLabel}>Batas/Kuota Belanja Per Hari</Text>
            <TextInput style={styles.input} placeholder="Contoh: 100000" keyboardType="numeric" value={inputLimit} onChangeText={setInputLimit} />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={onClose}><Text style={styles.cancelText}>Batal</Text></Pressable>
              <Pressable style={styles.submitButton} onPress={() => { onSaveSetup(parseFloat(inputBalance) || 0, parseFloat(inputLimit) || 0); onClose(); }}>
                <Text style={styles.submitText}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: TRANSAKSI KAS */}
      <Modal visible={activeModal === 'transaction'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Catat Transaksi Kas</Text>
            <View style={styles.typeSelector}>
              <Pressable style={[styles.typeButton, transType === 'outflow' && styles.typeButtonOutflow]} onPress={() => setTransType('outflow')}>
                <Text style={[styles.typeText, transType === 'outflow' && styles.typeTextActive]}>Pengeluaran</Text>
              </Pressable>
              <Pressable style={[styles.typeButton, transType === 'inflow' && styles.typeButtonInflow]} onPress={() => setTransType('inflow')}>
                <Text style={[styles.typeText, transType === 'inflow' && styles.typeTextActive]}>Pemasukan</Text>
              </Pressable>
            </View>
            <TextInput style={styles.input} placeholder="Keterangan (misal: Makan Siang)" value={transTitle} onChangeText={setTransTitle} />
            <TextInput style={styles.input} placeholder="Nominal (misal: 25000)" keyboardType="numeric" value={transAmount} onChangeText={setTransAmount} />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={onClose}><Text style={styles.cancelText}>Batal</Text></Pressable>
              <Pressable style={styles.submitButton} onPress={() => {
                if (!transTitle || !transAmount) return;
                onAddTransaction({
                  id: Date.now().toString(),
                  title: transTitle,
                  amount: parseFloat(transAmount) || 0,
                  type: transType,
                  category: transType === 'inflow' ? 'Pemasukan' : 'Pengeluaran',
                  date: 'Hari ini',
                });
                setTransTitle(''); setTransAmount(''); onClose();
              }}>
                <Text style={styles.submitText}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: ASET CRYPTO */}
      <Modal visible={activeModal === 'crypto'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Aset Crypto</Text>
            <TextInput style={styles.input} placeholder="Nama Koin (misal: Bitcoin)" value={cryptoName} onChangeText={setCryptoName} />
            <TextInput style={styles.input} placeholder="Simbol (misal: BTC)" value={cryptoSymbol} onChangeText={setCryptoSymbol} />
            <TextInput style={styles.input} placeholder="Jumlah Aset (misal: 0.05)" keyboardType="numeric" value={cryptoAmount} onChangeText={setCryptoAmount} />
            <TextInput style={styles.input} placeholder="Harga Saat Ini dalam IDR" keyboardType="numeric" value={cryptoPrice} onChangeText={setCryptoPrice} />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={onClose}><Text style={styles.cancelText}>Batal</Text></Pressable>
              <Pressable style={styles.submitButton} onPress={() => {
                if (!cryptoName || !cryptoAmount || !cryptoPrice) return;
                onAddCrypto({
                  id: Date.now().toString(),
                  name: cryptoName,
                  symbol: cryptoSymbol.toUpperCase() || 'COIN',
                  amount: parseFloat(cryptoAmount) || 0,
                  priceIdr: parseFloat(cryptoPrice) || 0,
                });
                setCryptoName(''); setCryptoSymbol(''); setCryptoAmount(''); setCryptoPrice(''); onClose();
              }}>
                <Text style={styles.submitText}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#0f172a' },
  inputLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  typeSelector: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  typeButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center' },
  typeButtonOutflow: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  typeButtonInflow: { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
  typeText: { fontSize: 13, color: '#64748b' },
  typeTextActive: { fontWeight: 'bold', color: '#0f172a' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { color: '#64748b' },
  submitButton: { backgroundColor: '#0f172a', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  submitText: { color: 'white', fontWeight: 'bold' },
});