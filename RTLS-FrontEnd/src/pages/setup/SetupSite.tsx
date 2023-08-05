import { SiteGrid } from "../../components/setup/SiteGrid";

export const SetupSite = ({
  setActiveStep,
  setSite,
  site,
  loading,
  setLoading,
  errorNet,
  setErrorNet,
}: {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  setSite: React.Dispatch<React.SetStateAction<string>>;
  site: string | undefined;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  errorNet: boolean;
  setErrorNet: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  
  return (
    <SiteGrid
      setActiveStep={setActiveStep}
      setSite={setSite}
      site={site}
      loading={loading}
      setLoading={setLoading}
      errorNet={errorNet}
      setErrorNet={setErrorNet}
    />
  );
};
