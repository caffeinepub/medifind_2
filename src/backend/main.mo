import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Custom Types
  type Address = {
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
    country : Text;
  };

  type Hospital = {
    id : Nat;
    name : Text;
    address : Address;
    latitude : Float;
    longitude : Float;
    phone : Text;
    email : Text;
    description : Text;
    owner : Principal;
  };

  type InventoryItem = {
    id : Nat;
    hospitalId : Nat;
    name : Text;
    category : Text;
    available : Bool;
    quantity : Nat;
    unit : Text;
  };

  type Treatment = {
    id : Nat;
    hospitalId : Nat;
    conditionName : Text;
    treatmentName : Text;
    description : Text;
  };

  type SearchResult = {
    hospital : Hospital;
    matchingItems : [InventoryItem];
    matchingTreatments : [Treatment];
  };

  type UserProfile = {
    name : Text;
  };

  // Compare modules for sorting
  module Hospital {
    public func compare(h : Hospital, h2 : Hospital) : Order.Order {
      Nat.compare(h.id, h2.id);
    };
  };

  module InventoryItem {
    public func compare(i1 : InventoryItem, i2 : InventoryItem) : Order.Order {
      Nat.compare(i1.id, i2.id);
    };
  };

  module Treatment {
    public func compare(t1 : Treatment, t2 : Treatment) : Order.Order {
      Nat.compare(t1.id, t2.id);
    };
  };

  let hospitals = Map.empty<Nat, Hospital>();
  let inventoryItems = Map.empty<Nat, InventoryItem>();
  let treatments = Map.empty<Nat, Treatment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextHospitalId = 1;
  var nextItemId = 1;
  var nextTreatmentId = 1;

  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Hospital Management
  public shared ({ caller }) func createHospital(
    name : Text,
    address : Address,
    latitude : Float,
    longitude : Float,
    phone : Text,
    email : Text,
    description : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create hospitals");
    };

    let hospitalId = nextHospitalId;
    nextHospitalId += 1;

    let hospital : Hospital = {
      id = hospitalId;
      name;
      address;
      latitude;
      longitude;
      phone;
      email;
      description;
      owner = caller;
    };

    hospitals.add(hospitalId, hospital);
    hospitalId;
  };

  public shared ({ caller }) func updateHospital(
    hospitalId : Nat,
    name : Text,
    address : Address,
    latitude : Float,
    longitude : Float,
    phone : Text,
    email : Text,
    description : Text
  ) : async () {
    let hospital = switch (hospitals.get(hospitalId)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?h) { h };
    };

    if (caller != hospital.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the hospital owner or admin can update this hospital");
    };

    let updatedHospital : Hospital = {
      id = hospitalId;
      name;
      address;
      latitude;
      longitude;
      phone;
      email;
      description;
      owner = hospital.owner;
    };

    hospitals.add(hospitalId, updatedHospital);
  };

  // Inventory Management
  public shared ({ caller }) func addInventoryItem(
    hospitalId : Nat,
    name : Text,
    category : Text,
    available : Bool,
    quantity : Nat,
    unit : Text
  ) : async Nat {
    let hospital = switch (hospitals.get(hospitalId)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?h) { h };
    };

    if (caller != hospital.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the hospital owner or admin can manage inventory");
    };

    let itemId = nextItemId;
    nextItemId += 1;

    let item : InventoryItem = {
      id = itemId;
      hospitalId;
      name;
      category;
      available;
      quantity;
      unit;
    };

    inventoryItems.add(itemId, item);
    itemId;
  };

  public shared ({ caller }) func updateInventoryItem(
    itemId : Nat,
    name : Text,
    category : Text,
    available : Bool,
    quantity : Nat,
    unit : Text
  ) : async () {
    let item = switch (inventoryItems.get(itemId)) {
      case (null) { Runtime.trap("Inventory item not found") };
      case (?i) { i };
    };

    let hospital = switch (hospitals.get(item.hospitalId)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?h) { h };
    };

    if (caller != hospital.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the hospital owner or admin can manage inventory");
    };

    let updatedItem : InventoryItem = {
      id = itemId;
      hospitalId = item.hospitalId;
      name;
      category;
      available;
      quantity;
      unit;
    };

    inventoryItems.add(itemId, updatedItem);
  };

  public shared ({ caller }) func removeInventoryItem(itemId : Nat) : async () {
    let item = switch (inventoryItems.get(itemId)) {
      case (null) { Runtime.trap("Inventory item not found") };
      case (?i) { i };
    };

    let hospital = switch (hospitals.get(item.hospitalId)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?h) { h };
    };

    if (caller != hospital.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the hospital owner or admin can manage inventory");
    };

    inventoryItems.remove(itemId);
  };

  // Treatment Management
  public shared ({ caller }) func addTreatment(
    hospitalId : Nat,
    conditionName : Text,
    treatmentName : Text,
    description : Text
  ) : async Nat {
    let hospital = switch (hospitals.get(hospitalId)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?h) { h };
    };

    if (caller != hospital.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the hospital owner or admin can manage treatments");
    };

    let treatmentId = nextTreatmentId;
    nextTreatmentId += 1;

    let treatment : Treatment = {
      id = treatmentId;
      hospitalId;
      conditionName;
      treatmentName;
      description;
    };

    treatments.add(treatmentId, treatment);
    treatmentId;
  };

  public shared ({ caller }) func updateTreatment(
    treatmentId : Nat,
    conditionName : Text,
    treatmentName : Text,
    description : Text
  ) : async () {
    let treatment = switch (treatments.get(treatmentId)) {
      case (null) { Runtime.trap("Treatment not found") };
      case (?t) { t };
    };

    let hospital = switch (hospitals.get(treatment.hospitalId)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?h) { h };
    };

    if (caller != hospital.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the hospital owner or admin can manage treatments");
    };

    let updatedTreatment : Treatment = {
      id = treatmentId;
      hospitalId = treatment.hospitalId;
      conditionName;
      treatmentName;
      description;
    };

    treatments.add(treatmentId, updatedTreatment);
  };

  public shared ({ caller }) func removeTreatment(treatmentId : Nat) : async () {
    let treatment = switch (treatments.get(treatmentId)) {
      case (null) { Runtime.trap("Treatment not found") };
      case (?t) { t };
    };

    let hospital = switch (hospitals.get(treatment.hospitalId)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?h) { h };
    };

    if (caller != hospital.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the hospital owner or admin can manage treatments");
    };

    treatments.remove(treatmentId);
  };

  // Public Queries (no authentication required)
  public query func getAllHospitals() : async [Hospital] {
    hospitals.values().toArray().sort();
  };

  public query func getHospitalDetails(hospitalId : Nat) : async {
    hospital : Hospital;
    inventory : [InventoryItem];
    treatments : [Treatment];
  } {
    let hospital = switch (hospitals.get(hospitalId)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?h) { h };
    };

    let inventory = inventoryItems.values().toArray().filter(
      func(item) { item.hospitalId == hospitalId }
    ).sort();

    let hospitalTreatments = treatments.values().toArray().filter(
      func(treatment) { treatment.hospitalId == hospitalId }
    ).sort();

    {
      hospital;
      inventory;
      treatments = hospitalTreatments;
    };
  };

  public query func searchHospitals(keyword : Text) : async [SearchResult] {
    let lowerKeyword = keyword.toLower();

    // Find all inventory items and treatments matching the keyword
    let filteredItems = inventoryItems.values().toArray().filter(
      func(i) {
        i.name.toLower().contains(#text lowerKeyword) or
        i.category.toLower().contains(#text lowerKeyword)
      }
    );

    let filteredTreatments = treatments.values().toArray().filter(
      func(t) {
        t.conditionName.toLower().contains(#text lowerKeyword) or
        t.treatmentName.toLower().contains(#text lowerKeyword) or
        t.description.toLower().contains(#text lowerKeyword)
      }
    );

    // Build results for ALL hospitals, including those matched by name
    let allHospitals = hospitals.values().toArray();

    let results = allHospitals.map(
      func(hospital) {
        let matchingItems = filteredItems.filter(
          func(item) { item.hospitalId == hospital.id }
        );
        let matchingTreatments = filteredTreatments.filter(
          func(treatment) { treatment.hospitalId == hospital.id }
        );
        {
          hospital;
          matchingItems;
          matchingTreatments;
        };
      }
    );

    // Return hospitals that match by name, or have matching items/treatments
    results.filter(
      func(result) {
        result.hospital.name.toLower().contains(#text lowerKeyword) or
        result.matchingItems.size() > 0 or
        result.matchingTreatments.size() > 0
      }
    );
  };
};
