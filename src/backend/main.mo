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

  // Demo owner principal (anonymous)
  let demoOwner = Principal.fromText("2vxsx-fae");

  // ── Seed Demo Hospitals ──────────────────────────────────────────────────
  // These are inserted at initialization so data is always present after deploy.
  // IDs 1-10 are reserved for demo hospitals; user hospitals start at 101.

  // Hospital 1: Angamaly General Hospital
  hospitals.add(1, {
    id = 1;
    name = "Angamaly General Hospital";
    address = { street = "Hospital Road"; city = "Angamaly"; state = "Kerala"; zip = "683572"; country = "India" };
    latitude = 10.1965;
    longitude = 76.3869;
    phone = "+91-484-2452100";
    email = "info@angamalyhospital.in";
    description = "A full-service general hospital serving Angamaly and surrounding areas.";
    owner = demoOwner;
  });
  inventoryItems.add(1,  { id = 1;  hospitalId = 1; name = "Paracetamol";    category = "Pharmaceutical Inventory"; available = true;  quantity = 500; unit = "tablets" });
  inventoryItems.add(2,  { id = 2;  hospitalId = 1; name = "Insulin";         category = "Pharmaceutical Inventory"; available = true;  quantity = 120; unit = "vials" });
  inventoryItems.add(3,  { id = 3;  hospitalId = 1; name = "Amoxicillin";     category = "Pharmaceutical Inventory"; available = true;  quantity = 200; unit = "capsules" });
  inventoryItems.add(4,  { id = 4;  hospitalId = 1; name = "A+";              category = "Blood Type";               available = true;  quantity = 15;  unit = "units" });
  inventoryItems.add(5,  { id = 5;  hospitalId = 1; name = "O+";              category = "Blood Type";               available = true;  quantity = 20;  unit = "units" });
  inventoryItems.add(6,  { id = 6;  hospitalId = 1; name = "B+";              category = "Blood Type";               available = true;  quantity = 10;  unit = "units" });
  inventoryItems.add(7,  { id = 7;  hospitalId = 1; name = "Cornea";          category = "Organ & Tissue Bank";      available = true;  quantity = 2;   unit = "units" });
  inventoryItems.add(8,  { id = 8;  hospitalId = 1; name = "Kidney";          category = "Organ & Tissue Bank";      available = false; quantity = 0;   unit = "units" });
  inventoryItems.add(9,  { id = 9;  hospitalId = 1; name = "Surgical Gloves"; category = "Medical Supplies & Consumables"; available = true; quantity = 1000; unit = "pairs" });
  inventoryItems.add(10, { id = 10; hospitalId = 1; name = "ECG Machine";     category = "Equipment Inventory";      available = true;  quantity = 3;   unit = "units" });
  treatments.add(1, { id = 1; hospitalId = 1; conditionName = "Diabetes";    treatmentName = "Insulin Therapy";        description = "Blood sugar management with insulin injections and monitoring." });
  treatments.add(2, { id = 2; hospitalId = 1; conditionName = "Hypertension"; treatmentName = "Antihypertensive Therapy"; description = "Medication and lifestyle modification for blood pressure control." });
  treatments.add(3, { id = 3; hospitalId = 1; conditionName = "Fever";        treatmentName = "Paracetamol Protocol";   description = "Fever management with paracetamol and hydration." });

  // Hospital 2: St. Mary's Medical Centre
  hospitals.add(2, {
    id = 2;
    name = "St. Mary's Medical Centre";
    address = { street = "Church Lane"; city = "North Angamaly"; state = "Kerala"; zip = "683572"; country = "India" };
    latitude = 10.2050;
    longitude = 76.3800;
    phone = "+91-484-2453200";
    email = "contact@stmarysmc.in";
    description = "A trusted medical centre in North Angamaly with specialised cardiac care.";
    owner = demoOwner;
  });
  inventoryItems.add(11, { id = 11; hospitalId = 2; name = "Aspirin";         category = "Pharmaceutical Inventory"; available = true;  quantity = 800; unit = "tablets" });
  inventoryItems.add(12, { id = 12; hospitalId = 2; name = "Clopidogrel";     category = "Pharmaceutical Inventory"; available = true;  quantity = 150; unit = "tablets" });
  inventoryItems.add(13, { id = 13; hospitalId = 2; name = "Atorvastatin";    category = "Pharmaceutical Inventory"; available = true;  quantity = 300; unit = "tablets" });
  inventoryItems.add(14, { id = 14; hospitalId = 2; name = "O-";              category = "Blood Type";               available = true;  quantity = 8;   unit = "units" });
  inventoryItems.add(15, { id = 15; hospitalId = 2; name = "A-";              category = "Blood Type";               available = true;  quantity = 6;   unit = "units" });
  inventoryItems.add(16, { id = 16; hospitalId = 2; name = "B-";              category = "Blood Type";               available = true;  quantity = 4;   unit = "units" });
  inventoryItems.add(17, { id = 17; hospitalId = 2; name = "IV Cannula";      category = "Medical Supplies & Consumables"; available = true; quantity = 500; unit = "pcs" });
  inventoryItems.add(18, { id = 18; hospitalId = 2; name = "Defibrillator";   category = "Equipment Inventory";      available = true;  quantity = 2;   unit = "units" });
  treatments.add(4, { id = 4; hospitalId = 2; conditionName = "Heart Attack";      treatmentName = "Cardiac Catheterisation";  description = "Emergency stent placement and thrombolytic therapy." });
  treatments.add(5, { id = 5; hospitalId = 2; conditionName = "Chest Pain";        treatmentName = "ECG and Troponin Protocol"; description = "Rapid cardiac workup with ECG monitoring and blood tests." });
  treatments.add(6, { id = 6; hospitalId = 2; conditionName = "Atrial Fibrillation"; treatmentName = "Rate Control Therapy";   description = "Rhythm management with antiarrhythmic medication." });

  // Hospital 3: Karukutty PHC
  hospitals.add(3, {
    id = 3;
    name = "Karukutty PHC";
    address = { street = "Main Road"; city = "Karukutty"; state = "Kerala"; zip = "683576"; country = "India" };
    latitude = 10.1520;
    longitude = 76.4015;
    phone = "+91-484-2471000";
    email = "karukuttyphc@kerala.gov.in";
    description = "Government primary health centre providing essential care to Karukutty.";
    owner = demoOwner;
  });
  inventoryItems.add(19, { id = 19; hospitalId = 3; name = "ORS";             category = "Pharmaceutical Inventory"; available = true;  quantity = 1000; unit = "sachets" });
  inventoryItems.add(20, { id = 20; hospitalId = 3; name = "Metformin";       category = "Pharmaceutical Inventory"; available = true;  quantity = 400;  unit = "tablets" });
  inventoryItems.add(21, { id = 21; hospitalId = 3; name = "Ciprofloxacin";   category = "Pharmaceutical Inventory"; available = true;  quantity = 200;  unit = "tablets" });
  inventoryItems.add(22, { id = 22; hospitalId = 3; name = "O+";              category = "Blood Type";               available = true;  quantity = 12;   unit = "units" });
  inventoryItems.add(23, { id = 23; hospitalId = 3; name = "A+";              category = "Blood Type";               available = true;  quantity = 7;    unit = "units" });
  inventoryItems.add(24, { id = 24; hospitalId = 3; name = "Bandages";        category = "Medical Supplies & Consumables"; available = true; quantity = 200; unit = "rolls" });
  inventoryItems.add(25, { id = 25; hospitalId = 3; name = "Glucometer";      category = "Equipment Inventory";      available = true;  quantity = 5;    unit = "units" });
  treatments.add(7, { id = 7; hospitalId = 3; conditionName = "Dehydration";    treatmentName = "ORS Rehydration";       description = "Oral rehydration solution and IV fluids for severe cases." });
  treatments.add(8, { id = 8; hospitalId = 3; conditionName = "Type 2 Diabetes"; treatmentName = "Metformin Protocol";   description = "Oral antidiabetic management with diet counselling." });
  treatments.add(9, { id = 9; hospitalId = 3; conditionName = "UTI";            treatmentName = "Antibiotic Course";     description = "Ciprofloxacin course with increased fluid intake." });

  // Hospital 4: Palissery Community Hospital
  hospitals.add(4, {
    id = 4;
    name = "Palissery Community Hospital";
    address = { street = "Palissery Junction"; city = "Palissery"; state = "Kerala"; zip = "683541"; country = "India" };
    latitude = 10.2215;
    longitude = 76.2720;
    phone = "+91-484-2441500";
    email = "info@palisseryhosp.in";
    description = "Community hospital serving Palissery and nearby villages with respiratory and general care.";
    owner = demoOwner;
  });
  inventoryItems.add(26, { id = 26; hospitalId = 4; name = "Salbutamol";      category = "Pharmaceutical Inventory"; available = true;  quantity = 250; unit = "inhalers" });
  inventoryItems.add(27, { id = 27; hospitalId = 4; name = "Omeprazole";      category = "Pharmaceutical Inventory"; available = true;  quantity = 350; unit = "capsules" });
  inventoryItems.add(28, { id = 28; hospitalId = 4; name = "Prednisolone";    category = "Pharmaceutical Inventory"; available = true;  quantity = 200; unit = "tablets" });
  inventoryItems.add(29, { id = 29; hospitalId = 4; name = "AB+";             category = "Blood Type";               available = true;  quantity = 5;   unit = "units" });
  inventoryItems.add(30, { id = 30; hospitalId = 4; name = "B+";              category = "Blood Type";               available = true;  quantity = 9;   unit = "units" });
  inventoryItems.add(31, { id = 31; hospitalId = 4; name = "O+";              category = "Blood Type";               available = true;  quantity = 11;  unit = "units" });
  inventoryItems.add(32, { id = 32; hospitalId = 4; name = "Nebuliser";       category = "Equipment Inventory";      available = true;  quantity = 8;   unit = "units" });
  inventoryItems.add(33, { id = 33; hospitalId = 4; name = "Enteral Feed Formula"; category = "Dietary & Nutrition Inventory"; available = true; quantity = 100; unit = "bottles" });
  treatments.add(10, { id = 10; hospitalId = 4; conditionName = "Asthma";         treatmentName = "Salbutamol Nebulisation"; description = "Bronchodilator therapy via nebuliser for acute asthma attacks." });
  treatments.add(11, { id = 11; hospitalId = 4; conditionName = "GERD";           treatmentName = "Proton Pump Inhibitor";  description = "Omeprazole therapy for acid reflux and gastric ulcer management." });
  treatments.add(12, { id = 12; hospitalId = 4; conditionName = "COPD";           treatmentName = "Bronchodilator Protocol"; description = "Combined salbutamol and prednisolone for COPD exacerbations." });

  // Hospital 5: Ernakulam Super Speciality Hospital (MRI, ICU, Dialysis)
  hospitals.add(5, {
    id = 5;
    name = "Ernakulam Super Speciality Hospital";
    address = { street = "NH-544, Bypass Road"; city = "Ernakulam"; state = "Kerala"; zip = "682024"; country = "India" };
    latitude = 10.0016;
    longitude = 76.3180;
    phone = "+91-484-2801200";
    email = "info@ernakulamssh.in";
    description = "Multi-specialty tertiary care hospital with advanced MRI imaging, ICU, and dialysis units.";
    owner = demoOwner;
  });
  inventoryItems.add(34, { id = 34; hospitalId = 5; name = "MRI Scan";              category = "Equipment Inventory";      available = true;  quantity = 2;   unit = "machines" });
  inventoryItems.add(35, { id = 35; hospitalId = 5; name = "ICU Bed";               category = "Equipment Inventory";      available = true;  quantity = 20;  unit = "beds" });
  inventoryItems.add(36, { id = 36; hospitalId = 5; name = "Dialysis Machine";       category = "Equipment Inventory";      available = true;  quantity = 8;   unit = "machines" });
  inventoryItems.add(37, { id = 37; hospitalId = 5; name = "CT Scanner";             category = "Equipment Inventory";      available = true;  quantity = 1;   unit = "machines" });
  inventoryItems.add(38, { id = 38; hospitalId = 5; name = "Ventilator";             category = "Equipment Inventory";      available = true;  quantity = 12;  unit = "units" });
  inventoryItems.add(39, { id = 39; hospitalId = 5; name = "A+";                     category = "Blood Type";               available = true;  quantity = 18;  unit = "units" });
  inventoryItems.add(40, { id = 40; hospitalId = 5; name = "A-";                     category = "Blood Type";               available = true;  quantity = 9;   unit = "units" });
  inventoryItems.add(41, { id = 41; hospitalId = 5; name = "B+";                     category = "Blood Type";               available = true;  quantity = 14;  unit = "units" });
  inventoryItems.add(42, { id = 42; hospitalId = 5; name = "B-";                     category = "Blood Type";               available = true;  quantity = 5;   unit = "units" });
  inventoryItems.add(43, { id = 43; hospitalId = 5; name = "O+";                     category = "Blood Type";               available = true;  quantity = 22;  unit = "units" });
  inventoryItems.add(44, { id = 44; hospitalId = 5; name = "O-";                     category = "Blood Type";               available = true;  quantity = 10;  unit = "units" });
  inventoryItems.add(45, { id = 45; hospitalId = 5; name = "Haemodialysis Consumables"; category = "Medical Supplies & Consumables"; available = true; quantity = 200; unit = "sets" });
  inventoryItems.add(46, { id = 46; hospitalId = 5; name = "Erythropoietin";         category = "Pharmaceutical Inventory"; available = true;  quantity = 80;  unit = "vials" });
  treatments.add(13, { id = 13; hospitalId = 5; conditionName = "Kidney Failure";     treatmentName = "Haemodialysis";          description = "Regular dialysis sessions to filter blood in patients with chronic kidney disease." });
  treatments.add(14, { id = 14; hospitalId = 5; conditionName = "Stroke";             treatmentName = "MRI-Guided Thrombolysis"; description = "MRI brain imaging followed by targeted clot-dissolving therapy." });
  treatments.add(15, { id = 15; hospitalId = 5; conditionName = "Critical Care";      treatmentName = "ICU Intensive Monitoring"; description = "24/7 intensive monitoring and life support for critically ill patients." });
  treatments.add(16, { id = 16; hospitalId = 5; conditionName = "Spinal Injury";      treatmentName = "MRI Spine Assessment";   description = "High-resolution MRI imaging and neurological evaluation for spinal cord injuries." });

  // Hospital 6: Aluva Cancer & Oncology Centre (Chemotherapy)
  hospitals.add(6, {
    id = 6;
    name = "Aluva Cancer and Oncology Centre";
    address = { street = "MG Road, Aluva"; city = "Aluva"; state = "Kerala"; zip = "683101"; country = "India" };
    latitude = 10.1004;
    longitude = 76.3512;
    phone = "+91-484-2624400";
    email = "care@aluvacancer.in";
    description = "Dedicated oncology centre offering chemotherapy, radiation therapy, and cancer screening for all stages.";
    owner = demoOwner;
  });
  inventoryItems.add(47, { id = 47; hospitalId = 6; name = "Chemotherapy";            category = "Equipment Inventory";      available = true;  quantity = 6;   unit = "infusion chairs" });
  inventoryItems.add(48, { id = 48; hospitalId = 6; name = "MRI Scan";                category = "Equipment Inventory";      available = true;  quantity = 1;   unit = "machines" });
  inventoryItems.add(49, { id = 49; hospitalId = 6; name = "ICU Bed";                 category = "Equipment Inventory";      available = true;  quantity = 10;  unit = "beds" });
  inventoryItems.add(50, { id = 50; hospitalId = 6; name = "Cisplatin";               category = "Pharmaceutical Inventory"; available = true;  quantity = 50;  unit = "vials" });
  inventoryItems.add(51, { id = 51; hospitalId = 6; name = "Doxorubicin";             category = "Pharmaceutical Inventory"; available = true;  quantity = 40;  unit = "vials" });
  inventoryItems.add(52, { id = 52; hospitalId = 6; name = "Paclitaxel";              category = "Pharmaceutical Inventory"; available = true;  quantity = 35;  unit = "vials" });
  inventoryItems.add(53, { id = 53; hospitalId = 6; name = "AB+";                     category = "Blood Type";               available = true;  quantity = 7;   unit = "units" });
  inventoryItems.add(54, { id = 54; hospitalId = 6; name = "AB-";                     category = "Blood Type";               available = true;  quantity = 3;   unit = "units" });
  inventoryItems.add(55, { id = 55; hospitalId = 6; name = "O+";                      category = "Blood Type";               available = true;  quantity = 16;  unit = "units" });
  inventoryItems.add(56, { id = 56; hospitalId = 6; name = "O-";                      category = "Blood Type";               available = true;  quantity = 8;   unit = "units" });
  inventoryItems.add(57, { id = 57; hospitalId = 6; name = "Infusion Pump";           category = "Equipment Inventory";      available = true;  quantity = 15;  unit = "units" });
  inventoryItems.add(58, { id = 58; hospitalId = 6; name = "Antiemetic Drugs";        category = "Pharmaceutical Inventory"; available = true;  quantity = 300; unit = "tablets" });
  treatments.add(17, { id = 17; hospitalId = 6; conditionName = "Breast Cancer";      treatmentName = "Chemotherapy Protocol"; description = "Combination chemotherapy with doxorubicin and cyclophosphamide for breast cancer." });
  treatments.add(18, { id = 18; hospitalId = 6; conditionName = "Lung Cancer";        treatmentName = "Platinum-based Chemotherapy"; description = "Cisplatin-based chemotherapy regimen for non-small cell lung cancer." });
  treatments.add(19, { id = 19; hospitalId = 6; conditionName = "Leukaemia";          treatmentName = "Induction Chemotherapy"; description = "High-dose induction chemotherapy to achieve remission in acute leukaemia." });
  treatments.add(20, { id = 20; hospitalId = 6; conditionName = "Cancer";             treatmentName = "Oncology Assessment";  description = "Comprehensive cancer staging, biopsy, and personalised treatment planning." });

  // Hospital 7: Muvattupuzha District Hospital (MRI, ICU, Dialysis, Chemotherapy, All Blood Types)
  hospitals.add(7, {
    id = 7;
    name = "Muvattupuzha District Hospital";
    address = { street = "District Hospital Road"; city = "Muvattupuzha"; state = "Kerala"; zip = "686661"; country = "India" };
    latitude = 9.9894;
    longitude = 76.5820;
    phone = "+91-485-2832100";
    email = "info@muvattupuzhadh.in";
    description = "Government district hospital with comprehensive facilities including MRI, ICU, dialysis, and chemotherapy services.";
    owner = demoOwner;
  });
  inventoryItems.add(59, { id = 59; hospitalId = 7; name = "MRI Scan";              category = "Equipment Inventory";      available = true;  quantity = 1;   unit = "machines" });
  inventoryItems.add(60, { id = 60; hospitalId = 7; name = "ICU Bed";               category = "Equipment Inventory";      available = true;  quantity = 15;  unit = "beds" });
  inventoryItems.add(61, { id = 61; hospitalId = 7; name = "Dialysis Machine";       category = "Equipment Inventory";      available = true;  quantity = 5;   unit = "machines" });
  inventoryItems.add(62, { id = 62; hospitalId = 7; name = "Chemotherapy";           category = "Equipment Inventory";      available = true;  quantity = 4;   unit = "infusion chairs" });
  inventoryItems.add(63, { id = 63; hospitalId = 7; name = "A+";                     category = "Blood Type";               available = true;  quantity = 13;  unit = "units" });
  inventoryItems.add(64, { id = 64; hospitalId = 7; name = "A-";                     category = "Blood Type";               available = true;  quantity = 6;   unit = "units" });
  inventoryItems.add(65, { id = 65; hospitalId = 7; name = "B+";                     category = "Blood Type";               available = true;  quantity = 11;  unit = "units" });
  inventoryItems.add(66, { id = 66; hospitalId = 7; name = "B-";                     category = "Blood Type";               available = true;  quantity = 4;   unit = "units" });
  inventoryItems.add(67, { id = 67; hospitalId = 7; name = "AB+";                    category = "Blood Type";               available = true;  quantity = 6;   unit = "units" });
  inventoryItems.add(68, { id = 68; hospitalId = 7; name = "AB-";                    category = "Blood Type";               available = true;  quantity = 2;   unit = "units" });
  inventoryItems.add(69, { id = 69; hospitalId = 7; name = "O+";                     category = "Blood Type";               available = true;  quantity = 19;  unit = "units" });
  inventoryItems.add(70, { id = 70; hospitalId = 7; name = "O-";                     category = "Blood Type";               available = true;  quantity = 8;   unit = "units" });
  inventoryItems.add(71, { id = 71; hospitalId = 7; name = "Ventilator";             category = "Equipment Inventory";      available = true;  quantity = 8;   unit = "units" });
  inventoryItems.add(72, { id = 72; hospitalId = 7; name = "X-Ray Machine";          category = "Equipment Inventory";      available = true;  quantity = 2;   unit = "machines" });
  inventoryItems.add(73, { id = 73; hospitalId = 7; name = "Methotrexate";           category = "Pharmaceutical Inventory"; available = true;  quantity = 60;  unit = "vials" });
  inventoryItems.add(74, { id = 74; hospitalId = 7; name = "Furosemide";             category = "Pharmaceutical Inventory"; available = true;  quantity = 200; unit = "tablets" });
  treatments.add(21, { id = 21; hospitalId = 7; conditionName = "Kidney Disease";    treatmentName = "Peritoneal Dialysis";    description = "Home-compatible peritoneal dialysis for chronic kidney disease patients." });
  treatments.add(22, { id = 22; hospitalId = 7; conditionName = "Brain Tumour";      treatmentName = "MRI-Guided Surgery Prep"; description = "Pre-surgical MRI mapping and neurosurgery preparation for brain tumours." });
  treatments.add(23, { id = 23; hospitalId = 7; conditionName = "Lymphoma";          treatmentName = "CHOP Chemotherapy";      description = "Cyclophosphamide, hydroxydaunorubicin, vincristine, prednisolone chemotherapy regimen." });
  treatments.add(24, { id = 24; hospitalId = 7; conditionName = "Septic Shock";      treatmentName = "ICU Sepsis Protocol";    description = "Aggressive IV antibiotics, vasopressors, and organ support in ICU." });
  treatments.add(25, { id = 25; hospitalId = 7; conditionName = "Post-Operative Care"; treatmentName = "ICU Recovery Protocol"; description = "Intensive post-surgical monitoring and pain management in ICU." });

  // Start user IDs well above demo data
  var nextHospitalId = 101;
  var nextItemId = 101;
  var nextTreatmentId = 101;

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

    results.filter(
      func(result) {
        result.hospital.name.toLower().contains(#text lowerKeyword) or
        result.matchingItems.size() > 0 or
        result.matchingTreatments.size() > 0
      }
    );
  };
};
