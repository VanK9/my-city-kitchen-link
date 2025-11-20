import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Landing from "./Landing";

const Index = () => {
  const { user } = useAuth();

  // If user is logged in, show the full app with navigation
  if (user) {
    return <Layout />;
  }

  // Otherwise show landing page
  return <Landing />;
};

export default Index;
