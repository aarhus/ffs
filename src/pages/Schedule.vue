<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Schedule</h1>
        <p class="text-muted-foreground">View your upcoming sessions</p>
      </div>
      <button @click="showNewSessionModal = true"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
        <CalendarIcon class="w-5 h-5" />
        New Session
      </button>
    </div>

    <div class="px-6 space-y-6">
      <!-- Upcoming Sessions -->
      <Card v-if="upcomingSessions.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Upcoming Sessions</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="session in upcomingSessions" :key="session.id"
            class="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            @click="selectedSession = selectedSession?.id === session.id ? null : session">
            <!-- Session Summary -->
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="font-semibold text-lg">{{ session.title }}</h3>
                <p class="text-sm text-muted-foreground">{{ formatSessionDate(session.date) }}</p>
              </div>
              <span :class="[
                'px-3 py-1 rounded text-xs font-medium',
                isSessionFull(session)
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-success/10 text-success'
              ]">
                {{ session.attendees.length }} / {{ session.capacity }}
              </span>
            </div>

            <!-- Session Details (Expanded) -->
            <div v-if="selectedSession?.id === session.id" class="mt-4 pt-4 border-t border-border space-y-3">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-muted-foreground">Type</p>
                  <p class="font-medium">{{ session.type }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Location</p>
                  <p class="font-medium">{{ session.location }}</p>
                </div>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-2">Attendees</p>
                <p class="text-sm">{{ session.attendees.length }} registered</p>
              </div>
              <div v-if="session.waitlist.length > 0">
                <p class="text-sm text-muted-foreground mb-2">Waitlist</p>
                <p class="text-sm">{{ session.waitlist.length }} waiting</p>
              </div>
              <div class="flex gap-2 pt-2">
                <button v-if="!isUserInSession(session)" @click.stop="rsvpSession(session.id)"
                  class="flex-1 px-3 py-2 bg-primary text-primary-foreground border border-primary text-sm rounded-lg hover:bg-primary/90 transition-colors">
                  {{ isSessionFull(session) ? 'Join Waitlist' : 'RSVP' }}
                </button>
                <button v-else @click.stop="cancelRsvp(session.id)"
                  class="flex-1 px-3 py-2 bg-destructive/10 text-destructive border border-destructive/20 text-sm rounded-lg hover:bg-destructive/20 transition-colors">
                  Cancel RSVP
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <EmptyState v-else title="No Upcoming Sessions" message="Check back soon for new sessions!" />

      <!-- Past Sessions -->
      <Card v-if="pastSessions.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Past Sessions</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="session in pastSessions" :key="session.id" class="p-4 opacity-75">
            <h3 class="font-semibold">{{ session.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ formatSessionDate(session.date) }} • {{ session.attendees.length
              }} attended</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- New Session Modal (Trainer Only) -->
    <Modal v-model="showNewSessionModal" title="Create Session">
      <div class="p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Create Session</h2>

        <form @submit.prevent="submitNewSession" class="space-y-4">
          <!-- Title -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Session Title</label>
            <input v-model="newSession.title" type="text" placeholder="e.g., Lower Body Day"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" required />
          </div>

          <!-- Date/Time -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Date & Time</label>
            <input v-model="newSession.date" type="datetime-local"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" required />
          </div>

          <!-- Capacity -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Capacity</label>
            <input v-model.number="newSession.capacity" type="number" min="1" placeholder="10"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" required />
          </div>

          <!-- Location -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Location</label>
            <input v-model="newSession.location" type="text" placeholder="Gym, Studio, Online"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" required />
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showNewSessionModal = false"
              class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
              Cancel
            </button>
            <button type="submit"
              class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
              Create
            </button>
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/common/Card.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Modal from '@/components/common/Modal.vue';
import CalendarIcon from '@/components/icons/CalendarIcon.vue';
import { useUserStore } from '@/stores/user';
import type { Session } from '@/types';
import { formatDistanceToNow, isFuture, isPast, parseISO } from 'date-fns';
import { computed, ref } from 'vue';

const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);

// TODO: Replace with actual API calls
const sessions = ref<Session[]>([]);
const clients = ref<any[]>([]);

// State
const showNewSessionModal = ref(false);
const selectedSession = ref<Session | null>(null);
const newSession = ref({
  title: '',
  date: '',
  capacity: 10,
  location: '',
});

// Computed
const upcomingSessions = computed(() =>
  sessions.value
    .filter(s => isFuture(parseISO(s.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
);

const pastSessions = computed(() =>
  sessions.value
    .filter(s => isPast(parseISO(s.date)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
);

// Methods
const formatSessionDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const isSessionFull = (session: Session) => {
  return session.attendees.length >= session.capacity;
};

const isUserInSession = (session: Session) => {
  return session.attendees.includes(currentUser.value?.id || '') ||
    session.waitlist.includes(currentUser.value?.id || '');
};

const rsvpSession = (sessionId: string) => {
  console.log('RSVP to session:', sessionId);
};

const cancelRsvp = (sessionId: string) => {
  console.log('Cancel RSVP:', sessionId);
};

const submitNewSession = async () => {
  if (!newSession.value.title || !newSession.value.date || !newSession.value.location) return;
  console.log('TODO: Create new session:', newSession.value);
  // TODO: Implement API call to create session
  showNewSessionModal.value = false;
};
</script>