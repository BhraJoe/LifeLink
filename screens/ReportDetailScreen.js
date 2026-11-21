import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator, Linking, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import BottomTabBar from './BottomTabBar';
import { getIncidentById, getIncidentComments, addIncidentComment, getUser, getAvatarUri, toggleCommentLike } from '../utils/authService';

const TYPE_ICONS = {
  flood: 'water-outline',
  fire: 'flame-outline',
  pothole: 'trail-sign-outline',
  accident: 'car-outline',
  general: 'alert-circle-outline',
};

const TYPE_LABELS = {
  flood: 'Flood',
  fire: 'Fire',
  pothole: 'Pothole',
  accident: 'Accident',
  general: 'General',
};

const commentAvatarColors = [
  '#EFF6FF', // blue-50
  '#FCE7F3', // pink-50
  '#ECFDF5', // green-50
  '#FEF3C7', // yellow-100
  '#E0E7FF', // indigo-100
  '#FDECEC', // red-50
  '#FFF7ED', // orange-50
];

const hash = (s) => s.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
const commentAvatarColor = (userId) => commentAvatarColors[Math.abs(hash(userId || '')) % commentAvatarColors.length];

export default function ReportDetailScreen({ onNavigate, onGoBack, routeParams }) {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const id = routeParams?.id;

  useEffect(() => {
    if (id) {
      loadIncident();
    }
    loadCurrentUser();
  }, [id]);

  const loadCurrentUser = async () => {
    try {
      const user = await getUser();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
  };

  const loadIncident = async () => {
    try {
      const data = await getIncidentById(id);
      setIncident(data);
      await loadComments();
    } catch (err) {
      console.error('Failed to load incident', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!id) return;
    try {
      setCommentLoading(true);
      const data = await getIncidentComments(id);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !id) return;
    try {
      const data = await addIncidentComment(id, commentText);
      setComments(data.incident.comments || []);
      setCommentText('');
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!id) return;
    try {
      const data = await toggleCommentLike(id, commentId);
      setComments(data.incident.comments || []);
    } catch (err) {
      console.error('Comment like error:', err);
    }
  };

  const openMap = () => {
    if (!incident?.latitude || !incident?.longitude) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${incident.latitude},${incident.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingHeader}>
          <TouchableOpacity style={styles.headerBack} onPress={onGoBack}>
            <Feather name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007A43" />
        </View>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingHeader}>
          <TouchableOpacity style={styles.headerBack} onPress={onGoBack}>
            <Feather name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Report not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const type = incident.type?.toLowerCase() || 'general';
  const iconName = TYPE_ICONS[type] || 'alert-circle-outline';
  const typeLabel = TYPE_LABELS[type] || 'General';
  const status = incident.status || 'ACTIVE';
  const statusColor = status === 'ACTIVE' ? '#DC2626' : status === 'RESOLVED' ? '#007A43' : '#D97706';
  const statusBg = status === 'ACTIVE' ? '#FEF2F2' : status === 'RESOLVED' ? '#F0FDF4' : '#FFF7ED';
  const createdAt = new Date(incident.createdAt);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={onGoBack} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {Array.isArray(incident.images) && incident.images.length > 0 && (
          <TouchableOpacity
            style={styles.heroImageContainer}
            onPress={() => setFullScreenImage(incident.images[0])}
            activeOpacity={0.9}
          >
            <Image source={{ uri: `data:image/jpeg;base64,${incident.images[0]}` }} style={styles.heroImage} resizeMode="cover" />
            {incident.images.length > 1 && (
              <View style={styles.imageCountBadge}>
                <Feather name="image" size={12} color="#FFFFFF" />
                <Text style={styles.imageCountText}>+{incident.images.length - 1}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Type & Status Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
            <Ionicons name={iconName} size={16} color="#2563EB" />
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{incident.title}</Text>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          {incident.location && (
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrap}>
                <Feather name="map-pin" size={16} color="#007A43" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{incident.location}</Text>
              </View>
            </View>
          )}
          {incident.createdAt && (
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrap}>
                <Feather name="clock" size={16} color="#6B7280" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Reported</Text>
                <Text style={styles.infoValue}>{timeAgo}</Text>
              </View>
            </View>
          )}
          {incident.reportedBy && (
            <View style={styles.infoCard}>
              <View style={styles.infoIconWrap}>
                <Feather name="user" size={16} color="#6B7280" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Reported by</Text>
                <Text style={styles.infoValue}>{incident.reportedBy}</Text>
              </View>
            </View>
          )}
          {incident.latitude != null && incident.longitude != null && (
            <TouchableOpacity style={[styles.infoCard, styles.mapInfoCard]} onPress={openMap} activeOpacity={0.7}>
              <View style={styles.infoIconWrap}>
                <Feather name="navigation" size={16} color="#007A43" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Coordinates</Text>
                <Text style={[styles.infoValue, { color: '#007A43' }]}>{incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {incident.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{incident.description}</Text>
          </View>
        ) : null}

        {/* Photos (if more than hero) */}
        {Array.isArray(incident.images) && incident.images.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos ({incident.images.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imageRow}>
                {incident.images.slice(1).map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.detailImageWrapper}
                    onPress={() => setFullScreenImage(img)}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: `data:image/jpeg;base64,${img}` }} style={styles.detailImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Comments */}
        <View style={styles.section}>
          <View style={styles.commentsHeader}>
            <Text style={styles.sectionTitle}>Comments</Text>
            <View style={styles.commentCountBadge}>
              <Text style={styles.commentCountText}>{comments.length}</Text>
            </View>
          </View>
          {commentLoading && (
            <View style={styles.commentsLoading}>
              <ActivityIndicator size="small" color="#007A43" />
            </View>
          )}
          {!commentLoading && comments.length === 0 && (
            <View style={styles.noCommentsWrap}>
              <Text style={styles.noCommentsText}>No comments yet.</Text>
              <Text style={styles.noCommentsHint}>Be the first to share your thoughts.</Text>
            </View>
          )}
          {comments.map((c, idx) => {
            const userId = c.userId || c.author || '';
            const avatarBg = commentAvatarColor(userId);
            const initial = (c.author || 'U').charAt(0).toUpperCase();
            const avatarUri = c.avatar ? (c.avatar.startsWith('data:') ? c.avatar : getAvatarUri(c.avatar)) : null;
            const userLiked = c.likedBy ? c.likedBy.includes(currentUser?.id || '') : false;
            const commentLikeCount = c.likes || 0;
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
                    <Text style={styles.commentMeta}>{formatTime(c.createdAt)}</Text>
                  </View>
                  <Text style={styles.commentText}>{c.text}</Text>
                  <TouchableOpacity style={styles.commentLikeRow} onPress={(e) => { e.stopPropagation(); handleCommentLike(c.id); }}>
                    <Feather name="heart" size={14} color={userLiked ? '#DC2626' : '#6B7280'} />
                    <Text style={[styles.commentLikeCount, userLiked ? { color: '#DC2626', fontWeight: '700' } : {}]}>{commentLikeCount}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        {currentUser && (
          <View style={styles.commentInputUserRow}>
            {currentUser.avatar ? (
              <Image source={{ uri: currentUser.avatar.startsWith('data:') ? currentUser.avatar : getAvatarUri(currentUser.avatar) }} style={styles.commentAvatar} resizeMode="cover" />
            ) : (
              <View style={[styles.commentAvatar, { backgroundColor: commentAvatarColor(currentUser.id || currentUser.fullName) }]}>
                <Text style={styles.commentAvatarText}>{(currentUser.fullName || currentUser.email || 'U').charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <Text style={styles.commentInputUserName}>{currentUser.fullName || currentUser.email}</Text>
          </View>
        )}
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
          numberOfLines={2}
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.commentSendBtn, !commentText.trim() && styles.commentSendBtnDisabled]}
          onPress={handleAddComment}
          disabled={!commentText.trim()}
        >
          <Feather name="send" size={16} color="#FFFFFF" />
          <Text style={styles.commentSendText}>Comment</Text>
        </TouchableOpacity>
      </View>

      {/* Full-screen image modal */}
      {fullScreenImage && (
        <Modal transparent visible onRequestClose={closeFullScreenImage}>
          <View style={styles.fullScreenOverlay}>
            <Image source={{ uri: `data:image/jpeg;base64,${fullScreenImage}` }} style={styles.fullScreenImage} resizeMode="contain" />
            <TouchableOpacity style={styles.closeFullScreenBtn} onPress={closeFullScreenImage} activeOpacity={0.7}>
              <View style={styles.closeBtnCircle}>
                <Feather name="x" size={22} color="#111827" />
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function getTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingHeader: { paddingHorizontal: 20, paddingTop: 10 },
  headerBack: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#6B7280' },

  heroImageContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, position: 'relative' },
  heroImage: { width: '100%', height: 200 },
  imageCountBadge: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },

  imageCountText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  typeBadgeText: { fontSize: 13, fontWeight: '700', color: '#2563EB', textTransform: 'capitalize' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  statusBadgeText: { fontSize: 13, fontWeight: '700' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16, lineHeight: 30 },

  infoCards: { marginBottom: 24 },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  mapInfoCard: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  infoIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111827' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  description: { fontSize: 15, color: '#4B5563', lineHeight: 24 },

  imageRow: { flexDirection: 'row', gap: 10 },
  detailImage: { width: 160, height: 120, borderRadius: 12 },
  detailImageWrapper: { borderRadius: 12, overflow: 'hidden' },

  commentsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  commentCountBadge: { backgroundColor: '#007A43', minWidth: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  commentCountText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  commentsLoading: { paddingVertical: 20, alignItems: 'center' },

  noCommentsWrap: { backgroundColor: '#F9FAFB', borderRadius: 12, paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center' },
  noCommentsText: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
  noCommentsHint: { fontSize: 13, color: '#9CA3AF' },

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

  commentInputContainer: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#E5E7EB', gap: 8 },
  commentInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, minHeight: 80, textAlignVertical: 'top', fontSize: 14, color: '#111827', backgroundColor: '#F9FAFB' },
  commentSendBtn: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007A43', borderRadius: 10, paddingVertical: 12, gap: 6 },
  commentSendBtnDisabled: { backgroundColor: '#E5E7EB' },
  commentSendText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  commentInputUserRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  commentInputUserName: { fontSize: 13, color: '#111827', fontWeight: '600' },

  fullScreenOverlay: { flex: 1, backgroundColor: '#000000' },
  fullScreenImage: { flex: 1 },
  closeFullScreenBtn: { position: 'absolute', top: 40, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  closeBtnCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});