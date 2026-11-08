
import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemDetails: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  itemSubtext: { fontSize: 12, color: '#64748b', marginTop: 2 },
  itemAmount: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },

  });