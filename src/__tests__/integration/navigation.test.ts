import { configureStore } from '@reduxjs/toolkit';
import routingReducer, { setRoute, setPage } from '../../store/slices/routingSlice';

describe('Integration: Navigation Flow', () => {
  const store = configureStore({
    reducer: {
      routing: routingReducer,
    },
  });

  it('should handle navigation between pages', () => {
    let state = store.getState().routing;

    // Start on home
    expect(state.route.page).toBe('home');

    // Navigate to dictionary
    store.dispatch(setRoute({ page: 'dictionary' }));
    state = store.getState().routing;
    expect(state.route.page).toBe('dictionary');
    expect(state.page).toBe(1); // Reset to page 1

    // Navigate to subject with filter
    store.dispatch(setRoute({ page: 'subject', value: 'Science' }));
    state = store.getState().routing;
    expect(state.route.page).toBe('subject');
    expect(state.page).toBe(1);

    // Navigate to specific word
    store.dispatch(setRoute({ page: 'word', word: 'example' }));
    state = store.getState().routing;
    expect(state.route.page).toBe('word');
    expect(state.page).toBe(1);

    // Navigate to about
    store.dispatch(setRoute({ page: 'about' }));
    state = store.getState().routing;
    expect(state.route.page).toBe('about');

    // Navigate to auth
    store.dispatch(setRoute({ page: 'auth' }));
    state = store.getState().routing;
    expect(state.route.page).toBe('auth');
  });

  it('should handle pagination state changes', () => {
    store.dispatch(setRoute({ page: 'dictionary' }));
    let state = store.getState().routing;
    expect(state.page).toBe(1);

    // Go to page 2
    store.dispatch(setPage(2));
    state = store.getState().routing;
    expect(state.page).toBe(2);

    // Go to page 5
    store.dispatch(setPage(5));
    state = store.getState().routing;
    expect(state.page).toBe(5);

    // Back to page 1
    store.dispatch(setPage(1));
    state = store.getState().routing;
    expect(state.page).toBe(1);
  });

  it('should reset page on route change', () => {
    // Set page to 5
    store.dispatch(setRoute({ page: 'dictionary' }));
    store.dispatch(setPage(5));
    let state = store.getState().routing;
    expect(state.page).toBe(5);

    // Change route - should reset page
    store.dispatch(setRoute({ page: 'subject', value: 'Biology' }));
    state = store.getState().routing;
    expect(state.page).toBe(1);
    expect(state.route.page).toBe('subject');
  });

  it('should handle subject, grade, and exam filters', () => {
    // Subject filter
    store.dispatch(setRoute({ page: 'subject', value: 'Mathematics' }));
    let state = store.getState().routing;
    expect(state.route.page).toBe('subject');
    expect((state.route as any).value).toBe('Mathematics');

    // Grade filter
    store.dispatch(setRoute({ page: 'grade', value: '10' }));
    state = store.getState().routing;
    expect(state.route.page).toBe('grade');
    expect((state.route as any).value).toBe('10');

    // Exam filter
    store.dispatch(setRoute({ page: 'exam', value: 'SAT' }));
    state = store.getState().routing;
    expect(state.route.page).toBe('exam');
    expect((state.route as any).value).toBe('SAT');
  });
});
