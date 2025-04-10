import HeaderSection from '../components/HeaderSection';
import { IoPersonOutline } from 'react-icons/io5';

export default function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <HeaderSection
        inline
        className={'mb-5'}
        title={'Account'}
        desc={'Placeholder content for Account Settings.'}
        icon={<IoPersonOutline className="w-10 h-10" />}
        key={'trash-header'}
      />
    </div>
  );
}
