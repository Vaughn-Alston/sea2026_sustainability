import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";



export default function PartyDrawer({
  visible,
  onClose,
  onStartParty,
}) {
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [selectedHours, setSelectedHours] = useState(null);
  const [selectedCoPilot, setSelectedCoPilot] = useState(null);
  const [page, setPage] = useState("planner");

  //State variable to control the visibility of the party drawer modal
  const [openModal, setOpenModal] = useState(null);




  const handleSelectHours = (hours) => {
    setSelectedHours(hours);
    setTimerModalVisible(false);
  };

  const handleSelectCoPilot = (coPilot) => {
    setSelectedCoPilot(coPilot);
    setPage("copilot");
  };

  const handleStartParty = () => {
    onStartParty({
      hours: selectedHours,
      coPilot: selectedCoPilot,
    });

    setPage("planner");
    setSelectedHours(null);
    setSelectedCoPilot(null);
  };

  const handleClose = () => {
    setPage("MapScreen");
    onClose();
   
  };

 return (
  <>
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >

    {/* This will be the area behind the party drawer when clicked it will close the modal */}
      <View style={styles.modalContainer}>
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
        />


        <View style={styles.drawer}>
          <Pressable
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>

          {/* Empty modal */}
        </View>
      </View>
    </Modal>
  </>
);
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  drawer: {
    width: "100%",
    height: "90%",
    backgroundColor: "#F7F7F9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },

  closeButtonText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000",
  },
});