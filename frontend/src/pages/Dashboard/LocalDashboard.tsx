import React from 'react';
import { useLocalAuth } from '../../contexts/LocalAuthContext';
import Layout from '../../components/Layout/Layout';
import DashboardStats from './DashboardStats';

const LocalDashboard: React.FC = () => {
    const { user } = useLocalAuth();

    if (!user) {
        return (
            <Layout>
                <div>Carregando...</div>
            </Layout>
        );
    }

    return <DashboardStats />;
};

export default LocalDashboard;