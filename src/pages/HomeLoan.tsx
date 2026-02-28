import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeLoan = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/loan-disbursement/new', { state: { preselect: 'home_loan' }, replace: true });
  }, [navigate]);
  return null;
};

export default HomeLoan;
