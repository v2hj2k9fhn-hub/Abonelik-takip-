import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, TextInput, Modal, Image, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [subs, setSubs] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('@my_subscriptions');
      if (saved) setSubs(JSON.parse(saved));
    } catch (e) { console.log("Yükleme hatası"); }
  };

  const saveData = async (data) => {
    try {
      await AsyncStorage.setItem('@my_subscriptions', JSON.stringify(data));
    } catch (e) { console.log("Kaydetme hatası"); }
  };

  const getLogoUrl = (text) => {
    // İsmi temizle (Boşlukları sil, küçük harf yap)
    const cleanName = text.toLowerCase().trim().replace(/\s/g, '');
    return `https://logo.clearbit.com/${cleanName}.com`;
  };

  const addSub = () => {
    if (!name || !price) return;
    const newSub = {
      id: Date.now().toString(),
      name: name,
      price: parseFloat(price.replace(',', '.')),
      logo: getLogoUrl(name)
    };
    const updated = [...subs, newSub];
    setSubs(updated);
    saveData(updated);
    setModalVisible(false); setName(''); setPrice('');
  };

  const deleteSub = (id) => {
    const filtered = subs.filter(s => s.id !== id);
    setSubs(filtered);
    saveData(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Toplam Harcama</Text>
        <Text style={styles.totalAmount}>₺{subs.reduce((a, b) => a + b.price, 0).toFixed(2)}</Text>
      </View>

      <FlatList
        data={subs}
        contentContainerStyle={{ padding: 20 }}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.subCard}>
            <View style={styles.logoWrapper}>
              <Image 
                source={{ uri: item.logo }} 
                style={styles.logoImage}
                // Logo yüklenemezse beyaz kare kalmaması için:
                onError={(e) => console.log("Görüntü yüklenemedi")}
              />
              {/* Logo yoksa arkada şık bir ikon dursun */}
              <Ionicons name="apps" size={20} color="#1E293B" style={{position: 'absolute', zIndex: -1}} />
            </View>

            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.subName}>{item.name}</Text>
              <Text style={styles.subType}>Aylık Abonelik</Text>
            </View>

            <View style={styles.priceTag}>
              <Text style={styles.subPrice}>₺{item.price.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity onPress={() => deleteSub(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={35} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Yeni Ekle</Text>
            <TextInput placeholder="Hizmet Adı (Örn: Netflix)" placeholderTextColor="#64748B" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Fiyat" placeholderTextColor="#64748B" style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />
            <TouchableOpacity style={styles.saveBtn} onPress={addSub}>
              <Text style={styles.saveBtnText}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop: 15}}>
              <Text style={{color: '#94A3B8', textAlign: 'center'}}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { padding: 40, alignItems: 'center', backgroundColor: '#1E293B', borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  headerTitle: { color: '#94A3B8', fontSize: 14 },
  totalAmount: { color: 'white', fontSize: 42, fontWeight: 'bold', marginTop: 10 },
  subCard: { backgroundColor: '#1E293B', padding: 15, borderRadius: 25, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  logoWrapper: { width: 50, height: 50, backgroundColor: 'white', borderRadius: 15, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  subName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  subType: { color: '#64748B', fontSize: 12 },
  priceTag: { backgroundColor: '#0F172A', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  subPrice: { color: 'white', fontWeight: 'bold' },
  deleteBtn: { marginLeft: 15 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#38BDF8', width: 65, height: 65, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 25 },
  modalBox: { backgroundColor: '#1E293B', borderRadius: 30, padding: 30 },
  modalTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#0F172A', color: 'white', padding: 15, borderRadius: 15, marginBottom: 15 },
  saveBtn: { backgroundColor: '#38BDF8', padding: 15, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
