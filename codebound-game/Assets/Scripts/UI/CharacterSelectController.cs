using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using System.Collections.Generic;
using CodeBound.Models;
using CodeBound.Services;

namespace CodeBound.UI
{
    /// <summary>
    /// Controls the Character Select scene with skin customization
    /// </summary>
    public class CharacterSelectController : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject skinCardPrefab;
        [SerializeField] private Transform skinGridContainer;
        [SerializeField] private GameObject previewPanel;
        [SerializeField] private Image characterPreview;
        [SerializeField] private Text skinNameText;
        [SerializeField] private Text skinDescriptionText;
        [SerializeField] private Text priceText;
        [SerializeField] private Button equipButton;
        [SerializeField] private Button purchaseButton;
        
        [Header("Services")]
        private ISkinService skinService;
        
        private List<Skin> availableSkins = new List<Skin>();
        private Skin selectedSkin;
        private string currentEquippedSkin;
        
        private void Start()
        {
            InitializeCharacterSelect();
        }
        
        private void InitializeCharacterSelect()
        {
            // Get services
            skinService = ServiceLocator.GetService<ISkinService>();
            
            LoadAvailableSkins();
            
            Debug.Log("Character Select initialized");
        }
        
        private async void LoadAvailableSkins()
        {
            if (skinService == null)
            {
                Debug.LogWarning("Skin service not available");
                return;
            }
            
            try
            {
                availableSkins = await skinService.GetAllSkins();
                GenerateSkinCards();
                
                // Load currently equipped skin
                currentEquippedSkin = await skinService.GetEquippedSkin();
                UpdateEquippedSkinVisual();
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"Failed to load skins: {ex.Message}");
            }
        }
        
        private void GenerateSkinCards()
        {
            if (skinGridContainer == null || skinCardPrefab == null)
            {
                Debug.LogWarning("Skin grid container or card prefab not assigned!");
                return;
            }
            
            // Clear existing cards
            foreach (Transform child in skinGridContainer)
            {
                Destroy(child.gameObject);
            }
            
            // Generate cards for each skin
            foreach (var skin in availableSkins)
            {
                GameObject cardObj = Instantiate(skinCardPrefab, skinGridContainer);
                cardObj.name = $"SkinCard_{skin.SkinId}";
                
                // Setup card visuals
                Image cardImage = cardObj.GetComponent<Image>();
                // TODO: Load and assign skin sprite
                
                Text cardText = cardObj.GetComponentInChildren<Text>();
                if (cardText != null)
                {
                    cardText.text = skin.SkinName;
                }
                
                // Add click listener
                Button cardButton = cardObj.GetComponent<Button>();
                if (cardButton != null)
                {
                    Skin skinRef = skin; // Capture for lambda
                    cardButton.onClick.AddListener(() => OnSkinCardClicked(skinRef));
                }
                
                // Visual indicator for owned/equipped skins
                if (skin.IsUnlocked)
                {
                    // Show checkmark or border
                }
            }
        }
        
        private void OnSkinCardClicked(Skin skin)
        {
            selectedSkin = skin;
            Debug.Log($"Skin selected: {skin.SkinName}");
            
            ShowSkinPreview(skin);
        }
        
        private void ShowSkinPreview(Skin skin)
        {
            if (previewPanel != null)
            {
                previewPanel.SetActive(true);
                
                // Update preview image
                if (characterPreview != null)
                {
                    // TODO: Load skin sprite
                }
                
                // Update skin info
                if (skinNameText != null)
                    skinNameText.text = skin.SkinName;
                
                if (skinDescriptionText != null)
                    skinDescriptionText.text = skin.Description;
                
                if (priceText != null)
                    priceText.text = skin.IsUnlocked ? "Owned" : $"{skin.Price} Tokens";
                
                // Update button states
                UpdateButtonStates(skin);
            }
        }
        
        private void UpdateButtonStates(Skin skin)
        {
            bool isEquipped = skin.SkinId == currentEquippedSkin;
            bool isOwned = skin.IsUnlocked;
            
            if (equipButton != null)
            {
                equipButton.gameObject.SetActive(isOwned && !isEquipped);
            }
            
            if (purchaseButton != null)
            {
                purchaseButton.gameObject.SetActive(!isOwned);
            }
        }
        
        private void UpdateEquippedSkinVisual()
        {
            // Update visual indicators for equipped skin
            // TODO: Add highlight or border to equipped skin card
        }
        
        #region Button Handlers
        
        public async void OnEquipButtonClicked()
        {
            if (selectedSkin == null || skinService == null)
            {
                Debug.LogWarning("No skin selected or service unavailable");
                return;
            }
            
            try
            {
                bool success = await skinService.EquipSkin(selectedSkin.SkinId);
                
                if (success)
                {
                    currentEquippedSkin = selectedSkin.SkinId;
                    UpdateEquippedSkinVisual();
                    UpdateButtonStates(selectedSkin);
                    Debug.Log($"Equipped skin: {selectedSkin.SkinName}");
                }
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"Failed to equip skin: {ex.Message}");
            }
        }
        
        public async void OnPurchaseButtonClicked()
        {
            if (selectedSkin == null || skinService == null)
            {
                Debug.LogWarning("No skin selected or service unavailable");
                return;
            }
            
            try
            {
                bool success = await skinService.PurchaseSkin(selectedSkin.SkinId);
                
                if (success)
                {
                    selectedSkin.IsUnlocked = true;
                    UpdateButtonStates(selectedSkin);
                    Debug.Log($"Purchased skin: {selectedSkin.SkinName}");
                }
                else
                {
                    Debug.LogWarning("Not enough tokens to purchase skin");
                    // TODO: Show error message to user
                }
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"Failed to purchase skin: {ex.Message}");
            }
        }
        
        public void OnClosePreview()
        {
            if (previewPanel != null)
            {
                previewPanel.SetActive(false);
            }
            selectedSkin = null;
        }
        
        public void OnBackButtonClicked()
        {
            Debug.Log("Returning to Main Menu");
            SceneManager.LoadScene("MainMenu");
        }
        
        #endregion
    }
}
