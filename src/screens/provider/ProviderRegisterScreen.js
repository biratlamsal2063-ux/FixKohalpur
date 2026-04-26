import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebase/firebaseConfig';

export default function ProviderRegisterScreen(props) {
  var navigation = props.navigation;
  var insets = useSafeAreaInsets();
  var nameState = useState(''); var name = nameState[0]; var setName = nameState[1];
  var emailState = useState(''); var email = emailState[0]; var setEmail = emailState[1];
  var phoneState = useState(''); var phone = phoneState[0]; var setPhone = phoneState[1];
  var passState = useState(''); var password = passState[0]; var setPassword = passState[1];
  var typeState = useState('electrician'); var serviceType = typeState[0]; var setServiceType = typeState[1];
  var rateState = useState(''); var rate = rateState[0]; var setRate = rateState[1];
  var expState = useState(''); var experience = expState[0]; var setExperience = expState[1];
  var bioState = useState(''); var bio = bioState[0]; var setBio = bioState[1];
  var loadState = useState(false); var loading = loadState[0]; var setLoading = loadState[1];

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !rate.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.'); return;
    }
    if (password.length < 6) { Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      var result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      var uid = result.user.uid;
      await setDoc(doc(db, 'users', uid), { uid: uid, name: name.trim(), email: email.trim(), phone: phone.trim(), role: 'provider', createdAt: serverTimestamp() });
      await setDoc(doc(db, 'providers', uid), { uid: uid, name: name.trim(), email: email.trim(), phone: phone.trim(), serviceType: serviceType, ratePerHour: parseInt(rate), experience: parseInt(experience) || 1, bio: bio.trim(), rating: 0, ratingSum: 0, reviewCount: 0, jobsCompleted: 0, isVerified: false, isAvailable: true, createdAt: serverTimestamp() });
      Alert.alert('Welcome!', 'Provider account created successfully.');
    } catch (error) { Alert.alert('Registration Failed', error.message); }
    setLoading(false);
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#E63946" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={function() { navigation.goBack(); }}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Join as Provider</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.hero}>
          <Text style={{ fontSize: 48 }}>{serviceType === 'electrician' ? '⚡' : '🔧'}</Text>
          <Text style={styles.heroText}>Register as a professional in Kohalpur</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Service Type</Text>
            <View style={{ flexDirection: 'row', gap: 10, padding: 12 }}>
              {[{ key: 'electrician', label: 'Electrician' }, { key: 'plumber', label: 'Plumber' }].map(function(t) {
                var active = serviceType === t.key;
                return (
                  <TouchableOpacity key={t.key} style={[styles.typeChip, active && styles.typeChipActive]} onPress={function() { setServiceType(t.key); }}>
                    <Text style={[styles.typeChipText, active && { color: '#fff' }]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personal Info</Text>
            {[
              { label: 'Full Name *', value: name, setter: setName, placeholder: 'Ram Bahadur Thapa', cap: 'words' },
              { label: 'Email *', value: email, setter: setEmail, placeholder: 'your@email.com', type: 'email-address' },
              { label: 'Phone *', value: phone, setter: setPhone, placeholder: '98XXXXXXXX', type: 'phone-pad' },
              { label: 'Password *', value: password, setter: setPassword, placeholder: 'Min 6 characters', secure: true },
            ].map(function(f, i, arr) {
              return (
                <View key={i} style={[styles.field, i < arr.length - 1 && styles.fieldBorder]}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextInput style={styles.fieldInput} value={f.value} onChangeText={f.setter} placeholder={f.placeholder} placeholderTextColor="#C0C0C0" keyboardType={f.type || 'default'} autoCapitalize={f.cap || 'none'} secureTextEntry={f.secure || false} />
                </View>
              );
            })}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Professional Info</Text>
            {[
              { label: 'Rate per Hour (Rs.) *', value: rate, setter: setRate, placeholder: 'e.g. 500', type: 'numeric' },
              { label: 'Experience (years)', value: experience, setter: setExperience, placeholder: 'e.g. 5', type: 'numeric' },
              { label: 'Bio', value: bio, setter: setBio, placeholder: 'Tell customers about yourself...', multi: true },
            ].map(function(f, i, arr) {
              return (
                <View key={i} style={[styles.field, i < arr.length - 1 && styles.fieldBorder]}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextInput style={[styles.fieldInput, f.multi && { height: 70 }]} value={f.value} onChangeText={f.setter} placeholder={f.placeholder} placeholderTextColor="#C0C0C0" keyboardType={f.type || 'default'} multiline={f.multi || false} textAlignVertical={f.multi ? 'top' : 'center'} />
                </View>
              );
            })}
          </View>
          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Creating Account...' : 'Create Provider Account'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center', padding: 12 }} onPress={function() { navigation.navigate('Login'); }}>
            <Text style={{ color: '#6B6B6B', fontSize: 13 }}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

var styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F1FAEE' },
  header: { backgroundColor: '#E63946', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  hero: { backgroundColor: '#E63946', alignItems: 'center', paddingBottom: 24 },
  heroText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  body: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#EEEEEE', overflow: 'hidden', marginBottom: 14 },
  cardTitle: { fontSize: 11, fontWeight: '700', color: '#A8A8A8', textTransform: 'uppercase', letterSpacing: 0.5, padding: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  typeChip: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  typeChipActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
  typeChipText: { fontSize: 13, fontWeight: '600', color: '#6B6B6B' },
  field: { padding: 12 },
  fieldBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#A8A8A8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  fieldInput: { fontSize: 14, color: '#1D1D1D', padding: 0, minHeight: 22 },
  btn: { backgroundColor: '#E63946', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
