# 🧪 PLAN DE TEST COMPLET - N8N DENDREO NODE v2.6.2

## 📋 OBJECTIF
Tester TOUS les endpoints un par un pour s'assurer que tout fonctionne correctement après toutes les corrections.

---

## 🎯 RESSOURCES AVEC OPÉRATIONS SPÉCIALISÉES

### ✅ 1. ENTREPRISES (Companies)
**Endpoint:** `entreprises.php`  
**ListSearch:** `getCompanies`  
**ResourceLocator:** `companyId`

- [ ] **Get Many Companies** - Doit lister les entreprises
- [ ] **Get a Company** - Dropdown list + saisie manuelle ID
- [ ] **Create Company** - Champs spécialisés (companyName, siret, address, etc.)
- [ ] **Update Company** - ResourceLocator + champs spécialisés
- [ ] **Delete Company** - ResourceLocator
- [ ] **Search Companies** - Terme de recherche

---

### ✅ 2. CONTACTS
**Endpoint:** `contacts.php`  
**ListSearch:** `getContacts`  
**ResourceLocator:** `contactId`

- [ ] **Get Many Contacts** - Doit lister les contacts
- [ ] **Get a Contact** - Dropdown list + saisie manuelle ID
- [ ] **Create Contact** - Champs spécialisés (contactCompany, lastName, firstName, etc.)
- [ ] **Update Contact** - ResourceLocator + champs spécialisés
- [ ] **Delete Contact** - ResourceLocator
- [ ] **Search Contacts** - Terme de recherche

---

### ✅ 3. ACTIONS DE FORMATION (Training Actions)
**Endpoint:** `actions_de_formation.php`  
**ListSearch:** `getTrainingActions`  
**ResourceLocator:** `recordId`

- [ ] **Get Many Training Actions** - Doit lister les actions
- [ ] **Get a Training Action** - Dropdown list + saisie manuelle ID
- [ ] **Create Training Action** - Champs spécialisés
- [ ] **Update Training Action** - ResourceLocator + champs spécialisés
- [ ] **Delete Training Action** - ResourceLocator

---

### ✅ 4. MODULES
**Endpoint:** `modules.php`  
**ListSearch:** `getModules`  
**ResourceLocator:** `recordId`

- [ ] **Get Many Modules** - Doit lister les modules
- [ ] **Get a Module** - Dropdown list + saisie manuelle ID
- [ ] **Create Module** - Champs spécialisés (moduleTitle, description, duration)
- [ ] **Update Module** - ResourceLocator + champs spécialisés
- [ ] **Delete Module** - ResourceLocator

---

### ✅ 5. PARTICIPANTS
**Endpoint:** `participants.php`  
**ListSearch:** `getParticipants`  
**ResourceLocator:** `recordId`

- [ ] **Get Many Participants** - Doit lister les participants
- [ ] **Get a Participant** - Dropdown list + saisie manuelle ID
- [ ] **Create Participant** - Champs spécialisés (company, lastName, firstName, etc.)
- [ ] **Update Participant** - ResourceLocator + champs spécialisés
- [ ] **Delete Participant** - ResourceLocator

---

### ✅ 6. CATEGORIES MODULE
**Endpoint:** `categories_module.php`  
**ListSearch:** `getCategoriesModule`  
**ResourceLocator:** `categoryModuleId`

- [ ] **Get Many Module Categories** - Doit lister les catégories
- [ ] **Get a Module Category** - Dropdown list + saisie manuelle ID
- [ ] **Create Module Category** - Champs spécialisés
- [ ] **Update Module Category** - ResourceLocator + champs spécialisés
- [ ] **Delete Module Category** - ResourceLocator

---

### ✅ 7. CATEGORIES PRODUIT
**Endpoint:** `categories_produit.php`  
**ListSearch:** `getCategoriesProduit`  
**ResourceLocator:** `categoryProduitId`

- [ ] **Get Many Product Categories** - Doit lister les catégories
- [ ] **Get a Product Category** - Dropdown list + saisie manuelle ID
- [ ] **Create Product Category** - Champs spécialisés
- [ ] **Update Product Category** - ResourceLocator + champs spécialisés
- [ ] **Delete Product Category** - ResourceLocator

---

### ✅ 8. FACTURES (Invoices) 
**Endpoint:** `factures.php`  
**ListSearch:** `getInvoices`  
**ResourceLocator:** `invoiceId` ⭐

- [ ] **Get Many Invoices** - Doit lister les factures (PRIORITÉ #1)
- [ ] **Get an Invoice** - Dropdown list + saisie manuelle ID
- [ ] **Create Invoice** - Champs JSON génériques
- [ ] **Update Invoice** - ResourceLocator + champs JSON
- [ ] **Delete Invoice** - ResourceLocator
- [ ] **Search Invoices** - Terme de recherche

---

### ✅ 9. FORMATEURS (Trainers)
**Endpoint:** `formateurs.php`  
**ListSearch:** `getTrainers`  
**ResourceLocator:** `trainerId` ⭐

- [ ] **Get Many Trainers** - Doit lister les formateurs (PRIORITÉ #2)
- [ ] **Get a Trainer** - Dropdown list + saisie manuelle ID
- [ ] **Create Trainer** - Champs JSON génériques
- [ ] **Update Trainer** - ResourceLocator + champs JSON
- [ ] **Delete Trainer** - ResourceLocator
- [ ] **Search Trainers** - Terme de recherche

---

### ✅ 10. SESSIONS PERMANENTES
**Endpoint:** `sessions_permanentes.php`  
**ListSearch:** `getSessionsPermanentes`  
**ResourceLocator:** `permanentSessionId` ⭐

- [ ] **Get Many Permanent Sessions** - Doit lister les sessions (PRIORITÉ #3)
- [ ] **Get a Permanent Session** - Dropdown list + saisie manuelle ID
- [ ] **Create Permanent Session** - Champs spécialisés (module, room, name, dates)
- [ ] **Update Permanent Session** - ResourceLocator + champs spécialisés
- [ ] **Delete Permanent Session** - ResourceLocator
- [ ] **Search Permanent Sessions** - Terme de recherche

---

### ✅ 11. CENTRES DE FORMATION
**Endpoint:** `centres_de_formation.php`  
**ListSearch:** `getTrainingCenters`  
**ResourceLocator:** `centerId` ⭐

- [ ] **Get Many Training Centers** - Doit lister les centres
- [ ] **Get a Training Center** - Dropdown list + saisie manuelle ID
- [ ] **Create Training Center** - Champs spécialisés
- [ ] **Update Training Center** - ResourceLocator + champs spécialisés  
- [ ] **Delete Training Center** - ResourceLocator

---

### ✅ 12. SALLES DE FORMATION
**Endpoint:** `salles_de_formation.php`  
**ListSearch:** `getTrainingRooms`  
**ResourceLocator:** `roomId` ⭐

- [ ] **Get Many Training Rooms** - Doit lister les salles
- [ ] **Get a Training Room** - Dropdown list + saisie manuelle ID
- [ ] **Create Training Room** - Champs spécialisés
- [ ] **Update Training Room** - ResourceLocator + champs spécialisés
- [ ] **Delete Training Room** - ResourceLocator

---

## 🔧 RESSOURCES AVEC NOUVEAUX RESOURCELOCATORS

### ✅ 13. CATALOGUE PROCHAINES SESSIONS
**Endpoint:** `catalogue_prochaines_sessions.php`  
**ListSearch:** `getCataloguePublicSessions`  
**ResourceLocator:** `publicSessionId` ⭐

- [ ] **Get Many** - Doit lister les sessions publiques
- [ ] **Get** - Dropdown list + saisie manuelle ID
- [ ] **Create** - Champs JSON génériques
- [ ] **Update** - ResourceLocator + champs JSON
- [ ] **Delete** - ResourceLocator

---

### ✅ 14. CRÉNEAUX
**Endpoint:** `creneaux.php`  
**ListSearch:** `getCreneaux`  
**ResourceLocator:** `timeSlotId` ⭐

- [ ] **Get Many** - Doit lister les créneaux
- [ ] **Get** - Dropdown list + saisie manuelle ID
- [ ] **Create** - Champs JSON génériques
- [ ] **Update** - ResourceLocator + champs JSON
- [ ] **Delete** - ResourceLocator

---

### ✅ 15. ÉTAPES
**Endpoint:** `etapes.php`  
**ListSearch:** `getEtapes`  
**ResourceLocator:** `stepId` ⭐

- [ ] **Get Many** - Doit lister les étapes
- [ ] **Get** - Dropdown list + saisie manuelle ID
- [ ] **Create** - Champs JSON génériques
- [ ] **Update** - ResourceLocator + champs JSON
- [ ] **Delete** - ResourceLocator

---

### ✅ 16. LIENS CRÉNEAU-FORMATEUR (LCF)
**Endpoint:** `lcfs.php`  
**ListSearch:** `getLcfs`  
**ResourceLocator:** `lcfId` ⭐

- [ ] **Get Many** - Doit lister les liens
- [ ] **Get** - Dropdown list + saisie manuelle ID
- [ ] **Create** - Champs JSON génériques
- [ ] **Update** - ResourceLocator + champs JSON
- [ ] **Delete** - ResourceLocator

---

## 🔍 TESTS SPÉCIAUX À VÉRIFIER

### ❌ ERREURS COMMUNES À ÉVITER
- [ ] Aucune erreur "Could not get parameter operation"
- [ ] Aucune erreur "Could not get parameter"
- [ ] Aucun champ en double (ex: Company ID)
- [ ] Tous les dropdowns se peuplent correctement
- [ ] Saisie manuelle d'ID fonctionne partout

### 🎯 RESOURCELOCATORS À TESTER
- [ ] Tous les "From List" affichent les bonnes données
- [ ] Tous les "By ID" acceptent la saisie manuelle
- [ ] Recherche dans les dropdowns fonctionne
- [ ] Aucun conflit de noms de paramètres

### 🚀 CHAMPS SPÉCIALISÉS À TESTER
- [ ] Contacts: Company selector + champs individuels
- [ ] Modules: Title, description, duration
- [ ] Participants: Company, nom, prénom, email, tel, date naissance
- [ ] Sessions permanentes: Module, salle, nom, dates
- [ ] Entreprises: Nom, SIRET, adresse, ville, code postal

---

## 🏆 PRIORITÉS DE TEST

### 🔥 PRIORITÉ ABSOLUE (Tester en PREMIER)
1. **Entreprises Get Many** - Était cassé, doit marcher maintenant
2. **Factures Get Many** - Était "Could not get parameter"
3. **Formateurs Get Many** - Était "Could not get parameter" 
4. **Sessions Permanentes Get Many** - Était "Could not get parameter"

### ⚡ PRIORITÉ ÉLEVÉE
5. Tous les ResourceLocators avec nouveaux noms (invoiceId, trainerId, etc.)
6. Entreprises Get - Plus de double Company ID
7. Toutes les opérations Create avec champs spécialisés

### 📊 PRIORITÉ NORMALE
8. Toutes les autres opérations Get/Update/Delete
9. Tous les nouveaux endpoints (creneaux, etapes, lcfs, catalogue)
10. Opérations Search et validation des données

---

## ✅ RÉSULTAT ATTENDU
**Tous les tests doivent PASSER** avant de considérer que le node est complètement fonctionnel.

**Version testée:** v2.6.2
**Date du test:** [À remplir]
**Testeur:** [À remplir]
