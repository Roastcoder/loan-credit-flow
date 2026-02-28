import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TeamApplications = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/loan-disbursement/new', { state: { preselect: 'other' }, replace: true });
  }, [navigate]);
  return null;
};

export default TeamApplications;
