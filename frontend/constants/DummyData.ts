export interface Destination {
  id: string;
  name: string;
  location: string;
  country: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  activities: string[];
  description: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  location: string;
  images: string[];
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export const destinations: Destination[] = [
  {
    id: '1',
    name: 'Emerald Pass',
    location: 'Swiss Alps',
    country: 'Switzerland',
    image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95',
    rating: 4.8,
    reviews: 234,
    price: 299,
    activities: ['Hiking', 'Photography', 'Camping'],
    description: 'Experience breathtaking views of the Swiss Alps at this iconic mountain pass.',
  },
  {
    id: '2',
    name: 'Summit Serenity',
    location: 'Banff',
    country: 'Canada',
    image: 'https://images.unsplash.com/photo-1609863539625-1ee649aea8e0',
    rating: 4.9,
    reviews: 456,
    price: 399,
    activities: ['Skiing', 'Hiking', 'Wildlife Viewing'],
    description: 'A perfect blend of luxury and adventure in the heart of the Canadian Rockies.',
  },
  // Add more destinations...
];

export const posts: Post[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Traveler',
    userImage: 'https://randomuser.me/api/portraits/women/1.jpg',
    location: 'Emerald Pass, Switzerland',
    images: [
      'https://images.unsplash.com/photo-1527668752968-14dc70a27c95',
    ],
    caption: 'Found this hidden gem in the Swiss Alps! The view is absolutely breathtaking 🏔️',
    likes: 1234,
    comments: 45,
    timestamp: '2h ago',
  },
  // Add more posts...
];

export const messages: Message[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Mountain Guide Service',
    userImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    lastMessage: 'Your guide will meet you at the base station at 8 AM tomorrow.',
    timestamp: '5m ago',
    unread: 2,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Lena\'s Donau Hotel',
    userImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastMessage: 'Thank you for your booking! We look forward to hosting you.',
    timestamp: '1h ago',
    unread: 1,
  },
  // Add more messages...
]; 