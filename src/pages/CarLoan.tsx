import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CarLoan = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/loan-disbursement/new', { state: { preselect: 'car_loan' }, replace: true });
  }, [navigate]);
  return null;
};

export default CarLoan;
