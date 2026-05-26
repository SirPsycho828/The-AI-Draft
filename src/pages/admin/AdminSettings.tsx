import { useConfig } from '../../hooks/useConfig';
import { ModelPicker } from '../../components/admin/ModelPicker';

export default function AdminSettings() {
  const { config, loading } = useConfig();

  if (loading) return <p className="text-gray-500">Loading config...</p>;

  if (!config) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">Settings</h1>
        <p className="text-gray-500">
          No config document found. Initialize the config by refreshing models with your OpenRouter API key.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Settings</h1>
      <div className="space-y-8">
        <ModelPicker config={config} />
      </div>
    </div>
  );
}
