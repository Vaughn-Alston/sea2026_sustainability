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

const coPilots = [
  {
    id: "1",
    name: "Ashley",
    image: {
      uri: "/Users/valston/Desktop/SEA - Project/party_mode/assets/snapchat/folder_page_1/eight.png",
    },
  },
  {
    id: "2",
    name: "Jordan",
    image: {
      uri: "/Users/valston/Desktop/SEA - Project/party_mode/assets/snapchat/folder_page_1/seven.png",
    },
  },
  {
    id: "3",
    name: "Michael",
    image: {
      uri: "/Users/valston/Desktop/SEA - Project/party_mode/assets/snapchat/folder_page_1/five.png",
    },
  },
  {
    id: "4",
    name: "Taylor",
    image: {
      uri: "/Users/valston/Desktop/SEA - Project/party_mode/assets/snapchat/folder_page_1/one.png",
    },
  },
  {
    id: "5",
    name: "Chris",
    image: {
      uri: "/Users/valston/Desktop/SEA - Project/party_mode/assets/snapchat/folder_page_1/three.png",
    },
  },
  {
    id: "6",
    name: "Maya",
    image: {
      uri: "x",
    },
  },
];

export default function PartyDrawer({
  visible,
  onClose,
  onStartParty,
}) {
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [selectedHours, setSelectedHours] = useState(null);
  const [selectedCoPilot, setSelectedCoPilot] = useState(null);
  const [page, setPage] = useState("planner");

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
    setPage("planner");
    setTimerModalVisible(false);
    onClose();
  };


  const handleTime = () => {




  };

  return (
  <>
    {/* Main Party Drawer */}
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
        />

        <View style={styles.drawer}>
          <View style={styles.drawerHandle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.drawerScrollContent}
          >
            <Text style={styles.mainTitle}>
              Party Mode 🪩
            </Text>

            <Text style={styles.mainDescription}>
              Choose your hours. Pick your co-pilot.
              {"\n"}
              Live in the moment.
            </Text>

            {/* Party Timer */}
            <Text style={styles.sectionTitle}>
              Party Timer
            </Text>

            <Pressable
              style={styles.optionRow}
              onPress={() => setTimerModalVisible(true)}
            >
              <View style={styles.optionIconContainer}>
                <Text style={styles.optionIcon}>🗓️</Text>
              </View>

              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>
                  Set your Party Timer
                </Text>

                <Text style={styles.optionDescription}>
                  {selectedHours
                    ? `${selectedHours} ${
                        selectedHours === 1 ? "hour" : "hours"
                      } selected`
                    : "How long are we committing to the plot?"}
                </Text>
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>

            {/* Co-pilot selection */}
            <Text style={styles.sectionTitle}>
              Select a Co-Pilot
            </Text>

            <View style={styles.coPilotCard}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.coPilotImages}
              >
                {coPilots.map((coPilot) => {
                  const isSelected =
                    selectedCoPilot?.id === coPilot.id;

                  return (
                    <Pressable
                      key={coPilot.id}
                      style={[
                        styles.coPilotImageButton,
                        isSelected &&
                          styles.selectedCoPilotImageButton,
                      ]}
                      onPress={() =>
                        handleSelectCoPilot(coPilot)
                      }
                    >
                      <Image
                        source={coPilot.image}
                        style={styles.coPilotImage}
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.coPilotInformation}>
                <View style={styles.optionIconContainer}>
                  <Text style={styles.optionIcon}>☷</Text>
                </View>

                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>
                    Invite a co-pilot
                  </Text>

                  <Text style={styles.optionDescription}>
                    {selectedCoPilot
                      ? `${selectedCoPilot.name} selected`
                      : "Pick a lookout for tonight"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Let's Party */}
            <Pressable
  style={[
    styles.partyButton,
    !selectedCoPilot && styles.partyButtonDisabled,
  ]}
  disabled={!selectedCoPilot}
  onPress={handleStartParty}
>
  <Text style={styles.partyButtonText}>
    Let’s Party!
  </Text>
</Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* Timer Selection Modal */}
    <Modal
      visible={timerModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setTimerModalVisible(false)}
    >
      <View style={styles.timerModalContainer}>
        <Pressable
          style={styles.timerBackdrop}
          onPress={() => setTimerModalVisible(false)}
        />

        <View style={styles.timerModalContent}>
          <Text style={styles.timerTitle}>
            Select Party Hours
          </Text>

          <Text style={styles.timerDescription}>
            How long should Party Mode stay active?
          </Text>

          <View style={styles.hoursGrid}>
            {Array.from({ length: 10 }, (_, index) => {
              const hours = index + 1;
              const isSelected = selectedHours === hours;

              return (
                <Pressable
                  key={hours}
                  style={[
                    styles.hourButton,
                    isSelected && styles.selectedHourButton,
                  ]}
                  onPress={() => handleSelectHours(hours)}
                >
                  <Text
                    style={[
                      styles.hourButtonText,
                      isSelected &&
                        styles.selectedHourButtonText,
                    ]}
                  >
                    {hours}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.timerCancelButton}
            onPress={() => setTimerModalVisible(false)}
          >
            <Text style={styles.timerCancelText}>
              Cancel
            </Text>
          </Pressable>
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
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  drawer: {
    width: "100%",
    maxHeight: "94%",
    minHeight: "85%",
    backgroundColor: "#F7F7F9",
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  drawerScrollContent: {
    paddingBottom: 20,
  },

  drawerHandle: {
    width: 48,
    height: 5,
    backgroundColor: "#D4D4D4",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 12,
  },

  mainTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    color: "#111111",
  },

  mainDescription: {
    marginTop: 3,
    marginBottom: 18,
    fontSize: 16,
    lineHeight: 21,
    color: "#747474",
    textAlign: "center",
  },

  sectionTitle: {
    marginBottom: 10,
    marginTop: 6,
    fontSize: 21,
    fontWeight: "800",
    color: "#111111",
  },

  optionRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 16,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  optionIconContainer: {
    width: 52,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  optionIcon: {
    fontSize: 30,
    color: "#111111",
  },

  optionTextContainer: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },

  optionDescription: {
    marginTop: 3,
    fontSize: 14,
    color: "#7B7B7B",
  },

  chevron: {
    fontSize: 32,
    fontWeight: "300",
    color: "#777777",
    marginLeft: 8,
  },

  coPilotCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  coPilotImages: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },

  coPilotImageButton: {
    width: 62,
    height: 82,
    borderRadius: 14,
    marginRight: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },

  selectedCoPilotImageButton: {
    borderColor: "#B225FF",
  },

  coPilotImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  coPilotInformation: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  partyButton: {
    backgroundColor: "#B225FF",
    paddingVertical: 17,
    borderRadius: 32,
    alignItems: "center",
    marginTop: 18,
  },

  partyButtonDisabled: {
    backgroundColor: "#D7A4ED",
  },

  partyButtonText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#555555",
    fontSize: 16,
    fontWeight: "600",
  },

  timerModalContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  timerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },

  timerModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
  },

  timerTitle: {
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
    color: "#111111",
  },

  timerDescription: {
    marginTop: 5,
    marginBottom: 18,
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
  },

  hoursGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  hourButton: {
    width: "18%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#EFEFEF",
    marginBottom: 10,
  },

  selectedHourButton: {
    backgroundColor: "#B225FF",
  },

  hourButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
  },

  selectedHourButtonText: {
    color: "#FFFFFF",
  },

  timerCancelButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },

  timerCancelText: {
    fontSize: 16,
    color: "#555555",
    fontWeight: "600",
  },

  coPilotPage: {
    flex: 1,
    alignItems: "center",
  },

  pageBackButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },

  pageBackText: {
    fontSize: 17,
    color: "#8A2BE2",
    fontWeight: "700",
  },

  selectedCoPilotImage: {
    width: 180,
    height: 220,
    borderRadius: 24,
    marginTop: 28,
    resizeMode: "cover",
  },

  selectedCoPilotName: {
    marginTop: 15,
    fontSize: 25,
    fontWeight: "800",
    color: "#111111",
  },

  summaryBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginTop: 25,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#777777",
  },

  summaryValue: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "800",
    color: "#111111",
  },

  confirmButton: {
    width: "100%",
    backgroundColor: "#B225FF",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 24,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});