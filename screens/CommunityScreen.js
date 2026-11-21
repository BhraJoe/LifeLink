import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator, Share, Modal, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import BottomTabBar from './BottomTabBar';
import { getIncidents, toggleLikeIncident, getIncidentComments, addIncidentComment, getAvatarUri, toggleCommentLike, getUser } from '../utils/authService';

const COMMENT_AVATAR_COLORS = [
  '#EFF6FF',
  '#FCE7F3',
  '#ECFDF5',
  '#FEF3C7',
  '#E0E7FF',
  '#FDECEC',
  '#FFF7ED',
];

const commentAvatarColor = (userId) => COMMENT_AVATAR_COLORS[String(userId || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0) % COMMENT_AVATAR_COLORS.length];

export default function CommunityScreen({ onNavigate }) {
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentModal, setCommentModal] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [modalComments, setModalComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    loadIncidents();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getUser();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
  };

  const applyFilter = (filter, source = allPosts) => {
    setActiveFilter(filter);
    if (!source || source.length === 0) {
      setPosts([]);
      return;
    }
    if (filter === 'All') {
      setPosts(source);
    } else if (filter === 'Incidents') {
      setPosts(source.filter(p => p.type !== 'missing' && p.type !== 'alert'));
    } else if (filter === 'Missing') {
      setPosts(source.filter(p => p.type === 'missing'));
    } else if (filter === 'Alerts') {
      setPosts(source.filter(p => p.type === 'alert' || p.status === 'alert'));
    } else {
      setPosts(source);
    }
  };

  const loadIncidents = async () => {
    try {
      const data = await getIncidents();
      const mapped = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        location: item.location,
        time: new Date(item.createdAt).toLocaleString(),
        images: Array.isArray(item.images) ? item.images : [],
        likes: item.likes || 0,
        comments: item.comments?.length || 0,
        likedBy: item.likedBy || [],
        type: item.type ? item.type.toLowerCase() : 'other',
        reportedBy: item.reportedBy,
        status: item.status,
        description: item.description,
        latitude: item.latitude,
        longitude: item.longitude,
      }));
      setAllPosts(mapped);
      applyFilter(activeFilter, mapped);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (post) => {
    try {
      const data = await toggleLikeIncident(post.id);
      const updated = data.incident;
      setPosts(prev => prev.map(p => {
        if (p.id === updated.id) {
          return {
            ...p,
            likes: updated.likes || 0,
            likedBy: updated.likedBy || [],
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const openCommentModal = async (post) => {
    setCommentText('');
    setModalComments([]);
    setCommentModal(post);
    try {
      const data = await getIncidentComments(post.id);
      setModalComments(data.comments || []);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const closeCommentModal = () => {
    setCommentModal(null);
    setCommentText('');
    setModalComments([]);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!commentModal) return;
    try {
      const data = await addIncidentComment(commentModal.id, commentText);
      const updated = data.incident;
      setModalComments(updated.comments || []);
      setCommentText('');
      setPosts(prev => prev.map(p => {
        if (p.id === updated.id) {
          return {
            ...p,
            comments: updated.comments?.length || 0,
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const handleCommentLike = async (incidentId, commentId) => {
    try {
      const data = await toggleCommentLike(incidentId, commentId);
      const updatedComments = data.incident?.comments || [];
      setModalComments(updatedComments);
      setPosts(prev => prev.map(p => {
        if (p.id === incidentId) {
          return { ...p, comments: updatedComments.length };
        }
        return p;
      }));
    } catch (err) {
      console.error('Comment like error:', err);
    }
  };

  const handleShare = (post) => {
    Share.share({
      message: `${post.title} — ${post.description || ''} (${post.location})`,
      title: 'LifeLink Incident Report',
    }).catch(() => {});
  };

  const openReport = (post) => {
    onNavigate('ReportDetail', { id: post.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#007A43" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <Feather name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.filtersRow}>
        <TouchableOpacity style={[styles.filterChip, activeFilter === 'All' && styles.filterChipActive]} onPress={() => applyFilter('All') }><Text style={activeFilter === 'All' ? styles.chipTextActive : styles.chipText}>All</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, activeFilter === 'Incidents' && styles.filterChipActive]} onPress={() => applyFilter('Incidents') }><Text style={activeFilter === 'Incidents' ? styles.chipTextActive : styles.chipText}>Incidents</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, activeFilter === 'Missing' && styles.filterChipActive]} onPress={() => applyFilter('Missing') }><Text style={activeFilter === 'Missing' ? styles.chipTextActive : styles.chipText}>Missing</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, activeFilter === 'Alerts' && styles.filterChipActive]} onPress={() => applyFilter('Alerts') }><Text style={activeFilter === 'Alerts' ? styles.chipTextActive : styles.chipText}>Alerts</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!posts || posts.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No incidents reported yet.</Text>
          </View>
        )}

        {posts.map(post => {
          const iconName = post.type === 'flood' ? 'water-outline' : post.type === 'fire' ? 'flame-outline' : post.type === 'pothole' ? 'trail-sign-outline' : post.type === 'accident' ? 'car-outline' : 'warning-outline';
          const userLiked = post.likedBy?.includes ? post.likedBy.includes : false;
          return (
            <TouchableOpacity key={post.id} style={styles.postCard} onPress={() => openReport(post)} activeOpacity={0.9}>
              <View style={styles.postHeader}>
                <View style={styles.postIconBox}>
                  <Ionicons name={iconName} size={20} color="#2563EB" />
                </View>
                <View style={styles.postMeta}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postSub}>{post.location}</Text>
                </View>
                <Text style={styles.timeText}>{post.time}</Text>
              </View>

              {post.images?.length > 0 && (
                <Image source={{ uri: `data:image/jpeg;base64,${post.images[0]}` }} style={styles.postImg} />
              )}

              {post.description ? (
                <Text style={styles.postDesc} numberOfLines={2}>{post.description}</Text>
              ) : null}

              <View style={styles.postFooter}>
                <View style={styles.actionGroup}>
                  <TouchableOpacity style={[styles.iconBtn, userLiked ? { color: '#DC2626' } : {}]} onPress={(e) => { e.stopPropagation(); handleLike(post); }}>
                    <Feather name="heart" size={18} color={userLiked ? '#DC2626' : '#6B7280'} />
                    <Text style={[styles.actionCount, userLiked ? { color: '#DC2626' } : {}]}>{post.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, { marginLeft: 16 }]} onPress={(e) => { e.stopPropagation(); openCommentModal(post); }}>
                    <Feather name="message-square" size={18} color="#6B7280" />
                    <Text style={styles.actionCount}>{post.comments}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.iconBtn} onPress={(e) => { e.stopPropagation(); handleShare(post); }}>
                  <Feather name="share-2" size={18} color="#6B7280" />
                  <Text style={styles.actionCount}>Share</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => onNavigate('ReportIncident')}>
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <BottomTabBar activeTab="Community" onTabPress={(tab) => onNavigate(tab)} onSosPress={() => onNavigate('SosTrigger')} />

      {commentModal && (
        <Modal transparent visible animationType="slide" onRequestClose={closeCommentModal}>
          <View style={styles.modalOverlay} onPress={closeCommentModal}>
            <View style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Comments</Text>
                <TouchableOpacity style={styles.modalClose} onPress={closeCommentModal}>
                  <Feather name="x" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              {modalComments.length > 0 && (
                <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                  {modalComments.map((c, idx) => {
                    const userId = c.userId || c.author || '';
                    const avatarBg = commentAvatarColor(userId);
                    const initial = (c.author || 'U').charAt(0).toUpperCase();
                    const userLiked = c.likedBy ? c.likedBy.includes(currentUser?.id || '') : false;
                    const commentLikeCount = c.likes || 0;
                    const avatarUri = c.avatar ? (c.avatar.startsWith('data:') ? c.avatar : getAvatarUri(c.avatar)) : null;
                    return (
                      <View key={c.id} style={styles.commentItem}>
                        {avatarUri ? (
                          <Image source={{ uri: avatarUri }} style={styles.commentAvatar} resizeMode="cover" />
                        ) : (
                          <View style={[styles.commentAvatar, { backgroundColor: avatarBg }]}>
                            <Text style={styles.commentAvatarText}>{initial}</Text>
                          </View>
                        )}
                        <View style={styles.commentContent}>
                          <View style={styles.commentHeaderRow}>
                            <Text style={styles.commentAuthor}>{c.author || 'User'}</Text>
                            <Text style={styles.commentMeta}>{new Date(c.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
                          </View>
                          <Text style={styles.commentText}>{c.text}</Text>
                          <TouchableOpacity style={styles.commentLikeRow} onPress={(e) => { e.stopPropagation(); handleCommentLike(commentModal.id, c.id); }}>
                            <Feather name="heart" size={14} color={userLiked ? '#DC2626' : '#6B7280'} />
                            <Text style={[styles.commentLikeCount, userLiked ? { color: '#DC2626', fontWeight: '700' } : {}]}>{commentLikeCount}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={styles.submitCommentBtn} onPress={handleAddComment}>
                <Text style={styles.submitCommentText}>Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8 },
  filterChipActive: { backgroundColor: '#007A43' },
  chipText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  chipTextActive: { fontSize: 13, color: '#FFFFFF', fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 80 },
  center: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#6B7280' },
  postCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 16, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  postIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  postMeta: { flex: 1 },
  postTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  postSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  timeText: { fontSize: 12, color: '#9CA3AF' },
  postImg: { width: '100%', height: 180 },
  postDesc: { paddingHorizontal: 14, fontSize: 13, color: '#4B5563', marginBottom: 10 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  actionGroup: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { flexDirection: 'row', alignItems: 'center' },
  actionCount: { fontSize: 13, color: '#4B5563', marginLeft: 6, fontWeight: '500' },
  fab: { position: 'absolute', right: 20, bottom: 80, width: 50, height: 50, borderRadius: 25, backgroundColor: '#007A43', justifyContent: 'center', alignItems: 'center', elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { maxHeight: '85%', width: '90%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalClose: { padding: 4 },
  commentsList: { marginBottom: 12 },
  commentItem: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderColor: '#F3F4F6', paddingBottom: 16 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 14, flexShrink: 0 },
  commentAvatarText: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  commentContent: { flex: 1 },
  commentHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: '#111827', marginRight: 8 },
  commentMeta: { fontSize: 11, color: '#9CA3AF' },
  commentText: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  commentLikeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  commentLikeCount: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  commentInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, minHeight: 120, textAlignVertical: 'top', fontSize: 14, color: '#111827' },
  submitCommentBtn: { marginTop: 12, backgroundColor: '#007A43', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  submitCommentText: { color: '#FFFFFF', fontWeight: '700' },
});
