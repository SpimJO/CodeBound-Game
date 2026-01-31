using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Manages the Character Selection Screen (Metal Slug Style).
/// Displays a grid of character cards with portraits.
/// Handles selection, equipping, and purchasing (redirect to shop).
/// </summary>
public class CharacterSelectManager : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private Transform cardContainer; // The grid layout group
    [SerializeField] private GameObject characterCardPrefab; // The prefab for a single card
    [SerializeField] private Image largePreviewImage; // Optional large preview
    [SerializeField] private TextMeshProUGUI selectedNameText;
    [SerializeField] private TextMeshProUGUI selectedDescText;
    [SerializeField] private Button selectButton;
    [SerializeField] private TextMeshProUGUI selectButtonText;

    [Header("Data")]
    [SerializeField] private SkinRegistry skinRegistry;

    private List<SkinData> ownedSkins;
    private SkinData currentlySelectedSkin;

    private void Start()
    {
        InitializeSelectionScreen();
    }

    private async void InitializeSelectionScreen()
    {
        // 1. Get Owned Skins from GameManager's SkinService
        var skinService = GameManager.Instance?.SkinService;
        if (skinService != null)
        {
            // Get auth token from SaveManager
            string authToken = SaveManager.Instance?.CurrentSave?.authToken ?? "";
            
            var skins = await skinService.GetOwnedSkins(authToken);
            if (skins != null && skins.Count > 0)
            {
                ownedSkins = skins;
            }
            else
            {
                // Fallback: Just get available skins for display
                var availableSkins = await skinService.GetAvailableSkins();
                ownedSkins = availableSkins ?? new List<SkinData> { CreateDefaultSkin() }; 
            }
        }
        else
        {
            Debug.LogWarning("SkinService missing, using dummy data");
            ownedSkins = new List<SkinData> { CreateDefaultSkin() };
        }

        // 2. Generate Cards
        GenerateCards();

        // 3. Select current equipped skin
        SelectSkin(ownedSkins.Find(s => s.isEquipped) ?? ownedSkins[0]);
    }
    
    private SkinData CreateDefaultSkin()
    {
        return new SkinData
        {
            skinId = "default",
            skinName = "NullPointer",
            description = "The default character",
            isOwned = true,
            isEquipped = true
        };
    }

    private void GenerateCards()
    {
        // Clear existing
        foreach (Transform child in cardContainer)
        {
            Destroy(child.gameObject);
        }

        foreach (var skinData in ownedSkins)
        {
            GameObject cardObj = Instantiate(characterCardPrefab, cardContainer);
            
            // Setup Visuals
            var portraitImg = cardObj.transform.Find("Portrait")?.GetComponent<Image>();
            var nameText = cardObj.transform.Find("NamePlate/Text")?.GetComponent<TextMeshProUGUI>();
            var frameImg = cardObj.GetComponent<Image>();
            var button = cardObj.GetComponent<Button>();

            // Get Assets from Registry
            var assets = skinRegistry.GetSkinAssets(skinData.skinId);

            if (portraitImg && assets != null)
            {
                // Prefer Detailed Portrait for this screen, fallback to Shop Icon
                portraitImg.sprite = assets.characterPortrait != null ? assets.characterPortrait : assets.shopIcon;
            }

            if (nameText)
            {
                nameText.text = skinData.skinName.ToUpper();
            }

            // Click Handler
            if (button)
            {
                button.onClick.AddListener(() => SelectSkin(skinData));
            }
        }
    }

    public void SelectSkin(SkinData skin)
    {
        currentlySelectedSkin = skin;

        // Update UI Info
        if (selectedNameText) selectedNameText.text = skin.skinName;
        if (selectedDescText) selectedDescText.text = skin.description;

        // Button State
        if (selectButton)
        {
            selectButton.onClick.RemoveAllListeners();
            if (skin.isEquipped)
            {
                selectButton.interactable = false;
                if (selectButtonText) selectButtonText.text = "EQUIPPED";
            }
            else
            {
                selectButton.interactable = true;
                if (selectButtonText) selectButtonText.text = "SELECT";
                selectButton.onClick.AddListener(ConfirmSelection);
            }
        }

        // Highlight selected card visually (optional logic iterate through cards)
        // SetSelectedCardVisuals(skin.skinId);
    }

    private async void ConfirmSelection()
    {
        if (currentlySelectedSkin == null) return;

        Debug.Log($"Equipping skin: {currentlySelectedSkin.skinId}");
        
        // Call Service to Equip via GameManager
        var skinService = GameManager.Instance?.SkinService;
        if (skinService != null)
        {
            string authToken = SaveManager.Instance?.CurrentSave?.authToken ?? "";
            bool success = await skinService.EquipSkin(currentlySelectedSkin.skinId, authToken);
            if (success)
            {
                // Determine animation or sound effect here
                Debug.Log("Skin Equipped!");
                
                // Update local save data
                if (SaveManager.Instance?.CurrentSave != null)
                {
                    SaveManager.Instance.CurrentSave.equippedSkin = currentlySelectedSkin.skinId;
                    SaveManager.Instance.CurrentSave.MarkDirty();
                }
                
                // Refresh list to update 'isEquipped' flags
                InitializeSelectionScreen();
            }
            else
            {
                Debug.LogError("Failed to equip skin");
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowError("Failed to equip skin. Please try again.");
                }
            }
        }
    }
}
