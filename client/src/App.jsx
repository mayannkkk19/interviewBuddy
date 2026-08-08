import { BrowserRouter } from 'react-router-dom';
import { InterviewProvider } from './context/InterviewContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <InterviewProvider>
        <AppRoutes />
      </InterviewProvider>
    </BrowserRouter>
  );
}

export default App;