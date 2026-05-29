import GithubContributions from './components/GithubContributions';
import LinkedInCard from './components/LinkedInCard';

const Dashboard = () => {
  return (
    <div className='space-y-5'>
      <GithubContributions />
      <LinkedInCard />
    </div>
  );
};

export default Dashboard;
