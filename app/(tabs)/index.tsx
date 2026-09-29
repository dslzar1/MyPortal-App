import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL } from '@/constants/api';

// Hardcoded until login/auth exists - this is the test student we created
// in Supabase's Table Editor.
const STUDENT_ID = 1;

type ClassEntry = {
  class_id: number;
  name: string;
  subject: string;
  current_percentage: string | null;
  current_letter_grade: string | null;
};

type DashboardData = {
  classes: ClassEntry[];
  gpa: string | null;
};

// Cycles through a handful of card colors so classes are visually
// distinct, echoing the Figma design's colored Class Overview cards.
const CARD_COLORS = ['#4A7A8C', '#8C7A4A', '#6B4A3A', '#7A5A8C', '#A34A4A', '#5A7A4A'];

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/students/${STUDENT_ID}/dashboard`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const json: DashboardData = await response.json();
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not reach the server. Is the backend running?'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>Holy Cross Regional High School</Text>
        <Text style={styles.pageTitle}>Dashboard</Text>
      </View>

      <ScrollView
        style={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        )}

        {!loading && error && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              Check that your backend is running (npm run dev in the backend folder) and that
              API_BASE_URL in constants/api.ts matches how you're testing (simulator vs.
              physical phone).
            </Text>
          </View>
        )}

        {!loading && !error && data && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Class Overview</Text>
              <Text style={styles.gpaLabel}>GPA: {data.gpa ?? '—'}</Text>
            </View>

            {data.classes.length === 0 ? (
              <Text style={styles.emptyText}>
                No classes yet. Add an enrollment row in Supabase to see it here.
              </Text>
            ) : (
              <View style={styles.grid}>
                {data.classes.map((c, i) => (
                  <View
                    key={c.class_id}
                    style={[styles.card, { backgroundColor: CARD_COLORS[i % CARD_COLORS.length] }]}
                  >
                    <Text style={styles.cardPercentage}>
                      {c.current_percentage ? `${Number(c.current_percentage)}%` : '—'}
                    </Text>
                    <Text style={styles.cardLetter}>{c.current_letter_grade ?? '?'}</Text>
                    <Text style={styles.cardName}>{c.name.trim()}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E24C3F',
  },
  header: {
    backgroundColor: '#E24C3F',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  schoolName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  pageTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 12,
  },
  body: {
    flex: 1,
    backgroundColor: '#EDEDED',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centered: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A34A4A',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
  },
  gpaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  cardPercentage: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  cardLetter: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});
