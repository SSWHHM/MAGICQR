/**
 * MOCK DATA — used when Firebase is not yet configured (.env is empty).
 * This lets you test the full admin UI and customer flow without a backend.
 *
 * TODO: Remove this file (or leave as-is) once Firebase is live — it is
 *       only ever used when import.meta.env.VITE_FIREBASE_API_KEY is absent.
 */

export const MOCK_USER = {
    uid: 'mock-admin-uid',
    email: 'admin@magicqr.dev',
    displayName: 'Demo Admin',
};

export const MOCK_BUSINESSES = [
    {
        id: 'biz-001',
        displayName: "Sharma's Ice Cream Parlour",
        slug: 'demo',
        placeId: 'ChIJdemo00000000000000000000001',
        logoUrl: null,
        createdAt: null,
    },
    {
        id: 'biz-002',
        displayName: 'Kapoor & Sons Law Firm',
        slug: 'kapoor-law',
        placeId: 'ChIJdemo00000000000000000000002',
        logoUrl: null,
        createdAt: null,
    },
];

export const MOCK_SERVICES = {
    'biz-001': [
        { id: 'svc-001', businessId: 'biz-001', name: 'Ice Cream', description: '', active: true },
        { id: 'svc-002', businessId: 'biz-001', name: 'Sundaes & Shakes', description: '', active: true },
        { id: 'svc-003', businessId: 'biz-001', name: 'Dine-in Experience', description: '', active: true },
    ],
    'biz-002': [
        { id: 'svc-004', businessId: 'biz-002', name: 'Property Law', description: 'Real estate transactions and disputes', active: true },
        { id: 'svc-005', businessId: 'biz-002', name: 'Tax Filing', description: 'Individual and business tax filing', active: true },
    ],
};

export const MOCK_VARIANTS = {
    'svc-001': [
        { id: 'var-001', text: "Best ice cream in the area! Tried the mango kulfi and it was absolutely divine. Will definitely come back for more!", status: 'active', lastServedAt: null },
        { id: 'var-002', text: "Fresh, creamy and not overly sweet. The portions are generous and the staff is always so warm and friendly. Highly recommend!", status: 'active', lastServedAt: null },
        { id: 'var-003', text: "My kids absolutely love this place! The ice cream is of top quality and there are so many flavours to choose from. 5 stars easily.", status: 'active', lastServedAt: null },
        { id: 'var-004', text: "Came here on a whim and left completely impressed. The chocolate brownie sundae is a must-try. Very reasonable prices too.", status: 'active', lastServedAt: null },
        { id: 'var-005', text: "Perfect place for a quick treat. Ice cream is fresh, not too sweet, and the service is quick. My go-to spot now!", status: 'active', lastServedAt: null },
        { id: 'var-006', text: "Wonderful ambiance and even better ice cream. Family-run place with so much heart. The pistachio flavour is outstanding.", status: 'active', lastServedAt: null },
    ],
    'svc-002': [
        { id: 'var-007', text: "The mango shake here is out of this world! Thick, creamy and tastes like actual mangoes — not fake flavouring. Loved it!", status: 'active', lastServedAt: null },
        { id: 'var-008', text: "Tried the chocolate sundae and was blown away. Generous toppings, great price. This place never disappoints!", status: 'active', lastServedAt: null },
        { id: 'var-009', text: "Best shakes in town, no doubt! The strawberry shake was so fresh and filling. Will be back very soon.", status: 'active', lastServedAt: null },
        { id: 'var-010', text: "Loved everything here! The brownie sundae is super indulgent. Service was fast and the staff was very sweet.", status: 'active', lastServedAt: null },
    ],
};

export const MOCK_EVENTS = {
    'biz-001': [
        { id: 'evt-001', type: 'scan', createdAt: null, anonSessionId: 's1' },
        { id: 'evt-002', type: 'scan', createdAt: null, anonSessionId: 's2' },
        { id: 'evt-003', type: 'scan', createdAt: null, anonSessionId: 's3' },
        { id: 'evt-004', type: 'next', createdAt: null, anonSessionId: 's1', serviceId: 'svc-001' },
        { id: 'evt-005', type: 'next', createdAt: null, anonSessionId: 's2', serviceId: 'svc-001' },
        { id: 'evt-006', type: 'next', createdAt: null, anonSessionId: 's3', serviceId: 'svc-002' },
        { id: 'evt-007', type: 'copy_open', createdAt: null, anonSessionId: 's1', serviceId: 'svc-001', variantId: 'var-001' },
        { id: 'evt-008', type: 'copy_open', createdAt: null, anonSessionId: 's2', serviceId: 'svc-001', variantId: 'var-002' },
        { id: 'evt-009', type: 'confirm_posted', createdAt: null, anonSessionId: 's1', serviceId: 'svc-001', variantId: 'var-001' },
    ],
    'biz-002': [
        { id: 'evt-010', type: 'scan', createdAt: null, anonSessionId: 's4' },
        { id: 'evt-011', type: 'next', createdAt: null, anonSessionId: 's4', serviceId: 'svc-004' },
        { id: 'evt-012', type: 'copy_open', createdAt: null, anonSessionId: 's4', serviceId: 'svc-004', variantId: 'var-007' },
    ],
};

export const MOCK_GENERATED_VARIANTS = [
    "Absolute gem of a place! The ice cream is so creamy and the flavours are incredibly unique. Cannot recommend enough!",
    "Visited with my family last weekend and everyone loved it. The butter pecan flavour is just wow. Will definitely return.",
    "Such a lovely spot. The staff is super friendly and the ice cream melts in your mouth. Value for money is great too.",
    "One of the best ice cream places I've been to. Fresh ingredients, generous portions, and a lovely cozy atmosphere.",
    "The mango flavour here is hands down the best I've had anywhere. Tastes exactly like the real fruit. Splendid!",
];
