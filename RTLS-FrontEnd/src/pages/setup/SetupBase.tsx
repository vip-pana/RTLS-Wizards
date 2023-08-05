import {
  Box,
  Center,
  HStack,
  IconButton,
  Spacer,
  Step,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { SetupPage } from "./SetupPage";
import { SetupSite } from "./SetupSite";
import { useState } from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { SetupSuccessfull } from "./SetupSuccessfull";
import { SetupNewAnchors } from "./SetupNewAnchors";
import { SetupNewTags } from "./SetupNewTags";
import { SetupDevices } from "./SetupDevices";
import { ConfirmModalProps } from "../../features/Interface";

export const SetupBase = () => {
  const [site, setSite] = useState<string>("");
  const steps = [
    { title: "Site" },
    { title: "Anchors" },
    { title: "Tags" },
    { title: "Positions" },
    { title: "Review" },
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: -1,
    count: steps.length,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errorNet, setErrorNet] = useState<boolean>(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const checkActiveStep = () => {
    switch (activeStep) {
      case -1:
        return <SetupPage setActiveStep={setActiveStep} />;
      case 0:
        return (
          <SetupSite
            setActiveStep={setActiveStep}
            setSite={setSite}
            site={site}
            loading={loading}
            setLoading={setLoading}
            errorNet={errorNet}
            setErrorNet={setErrorNet}
          />
        );
      case 1:
        return (
          <SetupNewAnchors
            site={site}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            loading={loading}
            setLoading={setLoading}
            errorNet={errorNet}
            setErrorNet={setErrorNet}
          />
        );
      case 2:
        return (
          <SetupNewTags
            site={site}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        );
      case 3:
        return (
          <SetupDevices
            site={site}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        );
      case 4:
        return <SetupSuccessfull />;
      default:
        break;
    }
  };

  return (
    <Box w={"100%"} h={"90vh"} minH={"90vh"}>
      <Box shadow={"2xl"} borderRadius="3xl" m={30} h={"full"}>
        <Stepper index={activeStep} m={50} pt={50}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>
              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
              </Box>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>
        <HStack>
          <IconButton
            aria-label={"back"}
            icon={<ArrowBackIcon />}
            ml={10}
            onClick={() => {
              activeStep != -1 ? setActiveStep(activeStep - 1) : null;
            }}
          />
          <Spacer />
          <IconButton
            aria-label={"back"}
            icon={<FaHome />}
            mr={10}
            onClick={onOpen}
          />
        </HStack>
        <Center>{checkActiveStep()}</Center>
      </Box>
      <HomeModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

const HomeModal = (props: ConfirmModalProps) => {
  const navigate = useNavigate();
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Are you sure?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Once you exit you will have to start the setup over again
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="teal"
            mr={3}
            onClick={() => {
              navigate("/");
            }}
          >
            Confirm
          </Button>
          <Button variant="ghost" onClick={props.onClose}>
            Back
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
