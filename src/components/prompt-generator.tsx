import React from 'react';
import { Card, CardBody, CardFooter, Input, Button, Textarea, Tabs, Tab, Chip, Select, SelectItem, RadioGroup, Radio, Image, Spinner, Accordion, AccordionItem, Badge, Tooltip, Alert } from "@heroui/react";
import { addToast } from "@heroui/react";
import { Icon } from "@iconify/react";

export const PromptGenerator: React.FC = () => {
  // Initial state values
  const initialStates = {
    selectedType: "image",
    selectedImageType: new Set(["portrait"]),
    selectedStyle: new Set(["realistic"]),
    selectedAspectRatio: new Set(["1:1"]),
    selectedLocation: new Set(["none"]),
    selectedMood: new Set(["none"]),
    selectedTime: new Set(["none"]),
    selectedWeather: new Set(["none"]),
    selectedAccessories: new Set(["none"]),
    selectedEmotion: new Set(["none"]),
    selectedResolution: new Set(["4k"]),
    selectedCameraAngle: new Set(["eye"]),
    selectedBackground: new Set(["with"]),
    promptText: "",
    enhancedPrompt: "",
    cleanedPrompt: "",
    isLoading: false,
    showResult: false,
    uploadedImage: null as File | null,
    imagePreview: null as string | null,
    manualInputs: {
      imageType: "",
      style: "",
      aspectRatio: "",
      location: "",
      mood: "",
      time: "",
      weather: "",
      accessories: "",
      emotion: "",
      resolution: "",
      cameraAngle: "",
      background: "",
    },
    imageAnalysis: null as any | null, // Adjust type as needed
    error: {
      title: "",
      message: "",
      visible: false
    }
  };

  const [selectedType, setSelectedType] = React.useState(initialStates.selectedType);
  const [selectedImageType, setSelectedImageType] = React.useState(initialStates.selectedImageType);
  const [selectedStyle, setSelectedStyle] = React.useState(initialStates.selectedStyle);
  const [selectedAspectRatio, setSelectedAspectRatio] = React.useState(initialStates.selectedAspectRatio);
  const [selectedLocation, setSelectedLocation] = React.useState(initialStates.selectedLocation);
  const [selectedMood, setSelectedMood] = React.useState(initialStates.selectedMood);
  const [selectedTime, setSelectedTime] = React.useState(initialStates.selectedTime);
  const [selectedWeather, setSelectedWeather] = React.useState(initialStates.selectedWeather);
  const [selectedAccessories, setSelectedAccessories] = React.useState(initialStates.selectedAccessories);
  const [selectedEmotion, setSelectedEmotion] = React.useState(initialStates.selectedEmotion);
  const [selectedResolution, setSelectedResolution] = React.useState(initialStates.selectedResolution);
  const [selectedCameraAngle, setSelectedCameraAngle] = React.useState(initialStates.selectedCameraAngle);
  const [selectedBackground, setSelectedBackground] = React.useState(initialStates.selectedBackground);
  
  const [promptText, setPromptText] = React.useState(initialStates.promptText);
  const [enhancedPrompt, setEnhancedPrompt] = React.useState(initialStates.enhancedPrompt);
  const [isLoading, setIsLoading] = React.useState(initialStates.isLoading);
  const [showResult, setShowResult] = React.useState(initialStates.showResult);
  
  // Add new state for cleaned prompt
  const [cleanedPrompt, setCleanedPrompt] = React.useState(initialStates.cleanedPrompt);
  
  // Add state for prompt history
  const [promptHistory, setPromptHistory] = React.useState<{id: string; title: string; prompt: string; date: Date}[]>([]);
  
  // Add new state for image upload
  const [uploadedImage, setUploadedImage] = React.useState<File | null>(initialStates.uploadedImage);
  const [imagePreview, setImagePreview] = React.useState<string | null>(initialStates.imagePreview);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Add new state for manual inputs
  const [manualInputs, setManualInputs] = React.useState<{[key: string]: string}>(initialStates.manualInputs);
  
  // Add new state for image analysis results
  const [imageAnalysis, setImageAnalysis] = React.useState<{
    colors: string[];
    composition: string;
    subject: string;
    style: string;
    mood: string;
    lighting: string;
    details: string[];
    perspective: string;
  } | null>(initialStates.imageAnalysis);
  
  // Add error state
  const [error, setError] = React.useState<{
    title: string;
    message: string;
    visible: boolean;
  }>(initialStates.error);
  
  // Load prompt history from localStorage on component mount
  React.useEffect(() => {
    const savedHistory = localStorage.getItem('jarvxPromptHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Ensure dates are parsed correctly if stored as strings
        const historyWithDates = parsedHistory.map((item: any) => ({ ...item, date: new Date(item.date) }));
        setPromptHistory(historyWithDates);
      } catch (error) {
        console.error("Error parsing prompt history from localStorage:", error);
      }
    }
  }, []);
  
  // Update localStorage whenever promptHistory changes
  React.useEffect(() => {
    localStorage.setItem('jarvxPromptHistory', JSON.stringify(promptHistory));
  }, [promptHistory]);
  
  // Function to clean prompt from explanations and tips
  const cleanPrompt = (prompt: string): string => {
    // Remove sections with headers like **Tips:** or **Keywords:**
    let cleaned = prompt;
    
    // Remove all lines starting with * or **
    cleaned = cleaned.split('\n')
      .filter(line => !line.trim().startsWith('*') && !line.trim().startsWith('**'))
      .join('\n');
      
    // Remove lines with "Tips:", "Keywords:", "Deskripsi Tambahan:", etc.
    const headersToRemove = [
      "Tips:", "Keywords:", "Deskripsi Tambahan:", "Penekanan Emosi:", 
      "Lingkungan yang Lebih Spesifik:", "Lighting yang Lebih Terarah:",
      "Menghilangkan \"Undefined\":", "Semoga prompt ini membantu"
    ];
    
    headersToRemove.forEach(header => {
      const regex = new RegExp(`.*${header}.*\\n?`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    
    // Remove empty lines at beginning and end
    cleaned = cleaned.trim();
    
    return cleaned;
  };
  
  // Handle manual input changes
  const handleManualInputChange = (key: string, value: string) => {
    setManualInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Function to save prompt to history - updated to use localStorage
  const savePromptToHistory = (prompt: string) => {
    const id = Date.now().toString();
    const title = promptText.length > 30 ? promptText.substring(0, 30) + "..." : promptText;
    const newHistoryItem = {
      id,
      title,
      prompt: cleanedPrompt, // Save the cleaned prompt
      date: new Date()
    };
    
    const updatedHistory = [newHistoryItem, ...promptHistory];
    setPromptHistory(updatedHistory);
    
    // Save to localStorage
    // localStorage.setItem('jarvxPromptHistory', JSON.stringify(updatedHistory)); // Already handled by useEffect
    
    // Show success toast
    addToast({
      title: "Prompt berhasil disimpan",
      description: "Prompt telah ditambahkan ke riwayat",
      color: "success",
    });
  };
  
  // Function to delete prompt from history - updated to use localStorage
  const deletePromptFromHistory = (id: string) => {
    const updatedHistory = promptHistory.filter(item => item.id !== id);
    setPromptHistory(updatedHistory);
    
    // Save to localStorage
    // localStorage.setItem('jarvxPromptHistory', JSON.stringify(updatedHistory)); // Already handled by useEffect
    
    // Show success toast
    addToast({
      title: "Prompt berhasil dihapus",
      color: "success",
    });
  };
  
  // Function to load prompt from history
  const loadPromptFromHistory = (historyItem: {id: string; title: string; prompt: string}) => {
    setCleanedPrompt(historyItem.prompt);
    setEnhancedPrompt(historyItem.prompt); // Also set enhanced prompt for consistency if needed
    setShowResult(true);
    // Optionally, you might want to reset other fields or set them based on the loaded prompt
    // For now, just showing the loaded prompt
  };
  
  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  // Enhanced image analysis with Gemini
  const analyzeImageWithGemini = async (file: File): Promise<void> => {
    try {
      // Show loading toast
      addToast({
        title: "Memproses gambar",
        description: "Menganalisis gambar referensi...",
        color: "primary",
      });
      
      // Convert image to base64 for analysis
      const base64Image = await fileToBase64(file);
      
      // Create a more detailed prompt for image analysis
      const analysisPrompt = `
        Please analyze this image in detail and provide the following information:
        1. Main subject/content of the image
        2. Dominant colors (provide 3-5 main colors)
        3. Visual style (e.g. realistic, cartoon, digital art, etc.)
        4. Composition and framing
        5. Lighting conditions
        6. Mood/atmosphere
        7. Notable details or elements
        8. Camera perspective (if applicable)
        
        Format your response as structured JSON with these fields:
        {
          "subject": "brief description of main subject",
          "colors": ["color1", "color2", "color3"],
          "style": "visual style name",
          "composition": "description of composition",
          "lighting": "description of lighting",
          "mood": "description of mood/atmosphere",
          "details": ["detail1", "detail2", "detail3"],
          "perspective": "camera angle/perspective"
        }
        
        IMPORTANT: Respond ONLY with the JSON object, no additional text.
      `;
      
      console.log("Sending image analysis request to Gemini API");
      
      try {
        // Call Gemini API with image analysis prompt
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyASFISq_9VRt6WL8D-swXjcg2MruG6ZTb8`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: analysisPrompt },
                  { 
                    inline_data: {
                      mime_type: file.type,
                      data: base64Image.split(',')[1] // Remove the data:image/jpeg;base64, part
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              topK: 32,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error response:", errorData);
          throw new Error(errorData.error?.message || "Terjadi kesalahan saat menganalisis gambar");
        }
        
        const data = await response.json();
        console.log("Image analysis API response:", data);
        
        if (!data.candidates || data.candidates.length === 0) {
          throw new Error("API tidak mengembalikan hasil analisis gambar.");
        }
        
        const analysisText = data.candidates[0].content.parts[0]?.text;
        
        if (!analysisText) {
          throw new Error("Respons API tidak mengandung teks analisis yang valid.");
        }
        
        // Parse the JSON response
        try {
          const analysisData = JSON.parse(analysisText);
          console.log("Parsed image analysis:", analysisData);
          
          // Update state with analysis results
          setImageAnalysis(analysisData);
          
          // Apply analysis results to form selections
          if (analysisData.style) {
            // Map the style to our dropdown options
            const styleMap: {[key: string]: string} = {
              "realistic": "realistic",
              "photorealistic": "realistic",
              "digital art": "digital_art",
              "cartoon": "cartoon",
              "anime": "anime",
              "watercolor": "watercolor",
              "oil painting": "oil_painting",
              "sketch": "pencil_sketch"
              // Add more mappings as needed
            };
            
            // Find the closest style match
            let matchedStyle = "auto";
            for (const [key, value] of Object.entries(styleMap)) {
              if (analysisData.style.toLowerCase().includes(key.toLowerCase())) {
                matchedStyle = value;
                break;
              }
            }
            
            setSelectedStyle(new Set([matchedStyle]));
          }
          
          // Set mood based on analysis
          if (analysisData.mood) {
            const moodMap: {[key: string]: string} = {
              "happy": "cheerful",
              "sad": "melancholic",
              "peaceful": "peaceful",
              "dramatic": "dramatic",
              "mysterious": "mystic",
              "dark": "dark",
              "romantic": "romantic",
              "epic": "epic"
              // Add more mappings as needed
            };
            
            // Find the closest mood match
            let matchedMood = "auto";
            for (const [key, value] of Object.entries(moodMap)) {
              if (analysisData.mood.toLowerCase().includes(key.toLowerCase())) {
                matchedMood = value;
                break;
              }
            }
            
            setSelectedMood(new Set([matchedMood]));
          }
          
          // Set camera angle based on analysis
          if (analysisData.perspective) {
            const perspectiveMap: {[key: string]: string} = {
              "eye level": "eye",
              "eye-level": "eye",
              "bird": "birds_eye",
              "aerial": "birds_eye",
              "top-down": "birds_eye",
              "low angle": "worms_eye",
              "worm": "worms_eye",
              "close": "close_up",
              "wide": "wide_shot",
              "panorama": "panorama"
              // Add more mappings as needed
            };
            
            // Find the closest perspective match
            let matchedPerspective = "auto";
            for (const [key, value] of Object.entries(perspectiveMap)) {
              if (analysisData.perspective.toLowerCase().includes(key.toLowerCase())) {
                matchedPerspective = value;
                break;
              }
            }
            
            setSelectedCameraAngle(new Set([matchedPerspective]));
          }
          
          // Show success toast
          addToast({
            title: "Analisis gambar berhasil",
            description: "Gambar referensi telah dianalisis dan pengaturan disesuaikan",
            color: "success",
          });
          
        } catch (jsonError) {
          console.error("Error parsing analysis JSON:", jsonError);
          throw new Error("Format respons analisis tidak valid.");
        }
        
      } catch (apiError) {
        console.error("API call error:", apiError);
        
        // Fallback to basic analysis if API fails
        console.log("Using fallback image analysis");
        
        // Create a basic analysis based on file metadata
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        
        const fallbackAnalysis = {
          subject: "Objek dalam gambar",
          colors: ["#3B82F6", "#1E40AF", "#DBEAFE", "#93C5FD", "#60A5FA"],
          composition: "Komposisi standar",
          lighting: "Pencahayaan normal",
          style: fileExtension === "png" ? "Digital art" : "Fotografi",
          mood: "Netral",
          details: ["Detail gambar terdeteksi"],
          perspective: "Eye level"
        };
        
        setImageAnalysis(fallbackAnalysis);
        
        // Set some reasonable defaults based on file type
        if (fileExtension === "png") {
          setSelectedStyle(new Set(["digital_art"]));
        } else if (["jpg", "jpeg"].includes(fileExtension)) {
          setSelectedStyle(new Set(["realistic"]));
        }
        
        // Show limited success toast
        addToast({
          title: "Analisis gambar terbatas",
          description: "Analisis detail tidak tersedia, menggunakan analisis dasar",
          color: "warning",
        });
      }
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      handleError(
        "Gagal menganalisis gambar", 
        "Terjadi kesalahan saat menganalisis gambar referensi"
      );
      
      // Reset image analysis state on error
      setImageAnalysis(null);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        addToast({
          title: "Format file tidak didukung",
          description: "Silakan unggah file gambar (JPG, PNG, GIF, dll)",
          color: "danger",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          title: "Ukuran file terlalu besar",
          description: "Ukuran file maksimal adalah 5MB",
          color: "danger",
        });
        return;
      }
      
      setUploadedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      addToast({
        title: "Gambar berhasil diunggah",
        description: "Menganalisis gambar referensi...",
        color: "primary",
      });
      
      // Analyze the image
      analyzeImageWithGemini(file);
    }
  };
  
  // Remove uploaded image
  const removeUploadedImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setImageAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Render result card with simplified design
  const renderResultCard = () => {
    return (
      <Card className="bg-content1 border-none shadow-lg max-w-2xl mx-auto">
        <CardBody className="p-4">
          <div className="bg-content2/50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
            <div className="whitespace-pre-wrap font-apple text-white text-sm">
              {cleanedPrompt}
            </div>
          </div>
        </CardBody>
        <CardFooter className="justify-between border-t border-divider p-2">
          <Button 
            variant="flat" 
            className="font-poppins transition-transform hover:scale-105"
            size="sm"
            onPress={() => setShowResult(false)}
          >
            Kembali
          </Button>
          <div className="flex gap-2">
            <Button 
              color="success" 
              className="font-poppins text-white transition-transform hover:scale-105"
              size="sm"
              onPress={() => savePromptToHistory(cleanedPrompt)}
              startContent={<Icon icon="lucide:save" />}
            >
              Simpan
            </Button>
            <Button 
              color="primary" 
              className="font-poppins text-white transition-transform hover:scale-105"
              size="sm"
              onPress={() => {
                navigator.clipboard.writeText(cleanedPrompt);
                addToast({
                  title: "Prompt disalin",
                  description: "Prompt telah disalin ke clipboard",
                  color: "success",
                });
              }}
              startContent={<Icon icon="lucide:copy" />}
            >
              Salin
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };
  
  // Enhanced handleFileSelect to include image analysis
  // ... existing code ...
  
  // Enhanced enhancePromptWithGemini with better error handling and debugging
  const enhancePromptWithGemini = async () => {
    setIsLoading(true);
    setShowResult(false);
    setError({ title: "", message: "", visible: false });
    
    try {
      // Validate input
      if (!promptText.trim()) {
        handleError(
          "Gagal membuat prompt", 
          "Deskripsi prompt tidak boleh kosong"
        );
        setIsLoading(false);
        return;
      }
      
      // Create prompt for Gemini with explicit request for English output
      let geminiPrompt = `Please create a detailed, professional prompt in ENGLISH for ${selectedType === "image" ? "generating an image" : selectedType === "video" ? "creating a video" : "writing code"} based on the following details:\n\n`;
      geminiPrompt += `Basic description: ${promptText}\n\n`;
      
      // Enhanced handling of reference image with analysis results
      if (uploadedImage && selectedType === "image" && imageAnalysis) {
        geminiPrompt += `Reference image analysis:\n`;
        geminiPrompt += `- Subject: ${imageAnalysis.subject}\n`;
        geminiPrompt += `- Style: ${imageAnalysis.style}\n`;
        geminiPrompt += `- Composition: ${imageAnalysis.composition}\n`;
        geminiPrompt += `- Lighting: ${imageAnalysis.lighting}\n`;
        geminiPrompt += `- Mood: ${imageAnalysis.mood}\n`;
        geminiPrompt += `- Perspective: ${imageAnalysis.perspective}\n`;
        geminiPrompt += `- Dominant colors: ${imageAnalysis.colors.join(', ')}\n`;
        if (imageAnalysis.details && imageAnalysis.details.length > 0) {
          geminiPrompt += `- Key details: ${imageAnalysis.details.join(', ')}\n`;
        }
        geminiPrompt += `\nPlease create a prompt that would generate an image with similar visual characteristics to the reference image while incorporating the user's selected parameters.\n\n`;
      } else if (uploadedImage && selectedType === "image") {
        geminiPrompt += `Note: The user has provided a reference image. Please create a prompt that would generate an image with similar style and composition.\n\n`;
        
        // Tambahkan informasi metadata gambar
        geminiPrompt += `Reference image details:\n`;
        geminiPrompt += `- File name: ${uploadedImage.name}\n`;
        geminiPrompt += `- File type: ${uploadedImage.type}\n`;
        geminiPrompt += `- File size: ${Math.round(uploadedImage.size / 1024)} KB\n\n`;
      }
      
      if (selectedType === "image") {
        // Handle image type - check manual input first
        if (manualInputs.imageType) {
          geminiPrompt += `Image Type: ${manualInputs.imageType}\n`;
        } else {
          const imageType = Array.from(selectedImageType)[0];
          geminiPrompt += `Image Type: ${imageType === "auto" ? "Automatic (best fit)" : imageType}\n`;
        }
        
        // Handle style - check manual input first
        if (manualInputs.style) {
          geminiPrompt += `Visual Style: ${manualInputs.style}\n`;
        } else {
          const style = Array.from(selectedStyle)[0];
          geminiPrompt += `Visual Style: ${style === "auto" ? "Automatic (best fit)" : style}\n`;
        }
        
        // Handle aspect ratio - check manual input first
        if (manualInputs.aspectRatio) {
          geminiPrompt += `Aspect Ratio: ${manualInputs.aspectRatio}\n`;
        } else {
          const aspectRatio = Array.from(selectedAspectRatio)[0];
          geminiPrompt += `Aspect Ratio: ${aspectRatio === "auto" ? "Automatic (best fit)" : aspectRatio}\n`;
        }
        
        // Handle location - check manual input first
        if (manualInputs.location) {
          geminiPrompt += `Location: ${manualInputs.location}\n`;
        } else {
          const location = Array.from(selectedLocation)[0];
          if (location !== "none" && location !== "auto") 
            geminiPrompt += `Location: ${location}\n`;
          else if (location === "auto")
            geminiPrompt += `Location: Automatic (best fit)\n`;
        }
        
        // Handle mood - check manual input first
        if (manualInputs.mood) {
          geminiPrompt += `Mood: ${manualInputs.mood}\n`;
        } else {
          const mood = Array.from(selectedMood)[0];
          if (mood !== "none" && mood !== "auto") 
            geminiPrompt += `Mood: ${mood}\n`;
          else if (mood === "auto")
            geminiPrompt += `Mood: Automatic (best fit)\n`;
        }
        
        // Handle time - check manual input first
        if (manualInputs.time) {
          geminiPrompt += `Time: ${manualInputs.time}\n`;
        } else {
          const time = Array.from(selectedTime)[0];
          if (time !== "none" && time !== "auto") 
            geminiPrompt += `Time: ${time}\n`;
          else if (time === "auto")
            geminiPrompt += `Time: Automatic (best fit)\n`;
        }
        
        // Handle weather - check manual input first
        if (manualInputs.weather) {
          geminiPrompt += `Weather: ${manualInputs.weather}\n`;
        } else {
          const weather = Array.from(selectedWeather)[0];
          if (weather !== "none" && weather !== "auto") 
            geminiPrompt += `Weather: ${weather}\n`;
          else if (weather === "auto")
            geminiPrompt += `Weather: Automatic (best fit)\n`;
        }
        
        // Handle accessories - check manual input first
        if (manualInputs.accessories) {
          geminiPrompt += `Accessories: ${manualInputs.accessories}\n`;
        } else {
          const accessories = Array.from(selectedAccessories)[0];
          if (accessories !== "none" && accessories !== "auto") 
            geminiPrompt += `Accessories: ${accessories}\n`;
          else if (accessories === "auto")
            geminiPrompt += `Accessories: Automatic (best fit)\n`;
        }
        
        // Handle emotion - check manual input first
        if (manualInputs.emotion) {
          geminiPrompt += `Emotion: ${manualInputs.emotion}\n`;
        } else {
          const emotion = Array.from(selectedEmotion)[0];
          if (emotion !== "none" && emotion !== "auto") 
            geminiPrompt += `Emotion: ${emotion}\n`;
          else if (emotion === "auto")
            geminiPrompt += `Emotion: Automatic (best fit)\n`;
        }
        
        // Handle resolution - check manual input first
        if (manualInputs.resolution) {
          geminiPrompt += `Resolution: ${manualInputs.resolution}\n`;
        } else {
          const resolution = Array.from(selectedResolution)[0];
          geminiPrompt += `Resolution: ${resolution === "auto" ? "Automatic (best fit)" : resolution}\n`;
        }
        
        // Handle camera angle - check manual input first
        if (manualInputs.cameraAngle) {
          geminiPrompt += `Camera Angle: ${manualInputs.cameraAngle}\n`;
        } else {
          const cameraAngle = Array.from(selectedCameraAngle)[0];
          geminiPrompt += `Camera Angle: ${cameraAngle === "auto" ? "Automatic (best fit)" : cameraAngle}\n`;
        }
        
        // Handle background - check manual input first
        if (manualInputs.background) {
          geminiPrompt += `Background: ${manualInputs.background}\n`;
        } else {
          const background = Array.from(selectedBackground)[0];
          geminiPrompt += `Background: ${background === "auto" ? "Automatic (best fit)" : background}\n`;
        }
      }
      
      // Modifikasi instruksi khusus untuk gambar referensi
      if (uploadedImage && selectedType === "image") {
        geminiPrompt += `\nSPECIAL INSTRUCTIONS:\n`;
        geminiPrompt += `1. Create a prompt that would help generate an image similar to the reference image the user provided.\n`;
        geminiPrompt += `2. Focus on incorporating the user's selected parameters into the prompt.\n`;
        geminiPrompt += `3. Include technical details that would help an AI image generator create a high-quality result.\n`;
        geminiPrompt += `4. Make the prompt detailed and specific to achieve the desired outcome.\n`;
      }
      
      geminiPrompt += `\nThe prompt should be detailed, professional, and ready to use with ${selectedType === "image" ? "AI image generators" : selectedType === "video" ? "AI video generators" : "AI code generators"}. IMPORTANT: The final prompt MUST be in ENGLISH only, with no explanations, tips, or additional notes.`;
      
      console.log("Sending prompt to Gemini API:", geminiPrompt.substring(0, 100) + "...");
      
      // Call Gemini API with enhanced context and proper error handling
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyASFISq_9VRt6WL8D-swXjcg2MruG6ZTb8`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: geminiPrompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });
        
        console.log("API Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error response:", errorData);
          
          // Handle specific API error codes
          if (errorData.error?.code === 429) {
            throw new Error("Batas penggunaan API tercapai. Coba lagi nanti.");
          } else if (errorData.error?.code === 400) {
            throw new Error("Permintaan tidak valid. Periksa input Anda.");
          } else if (errorData.error?.code === 403) {
            throw new Error("Akses ke API ditolak. Periksa kunci API Anda.");
          } else {
            throw new Error(errorData.error?.message || "Terjadi kesalahan saat menghubungi API");
          }
        }
        
        const data = await response.json();
        console.log("API Response data:", data);
        
        if (!data.candidates || data.candidates.length === 0) {
          throw new Error("API tidak mengembalikan hasil. Coba lagi dengan prompt yang berbeda.");
        }
        
        if (!data.candidates[0]?.content?.parts || data.candidates[0].content.parts.length === 0) {
          throw new Error("Format respons API tidak valid.");
        }
        
        const generatedText = data.candidates[0].content.parts[0]?.text;
        
        if (!generatedText || typeof generatedText !== 'string') {
          throw new Error("Respons API tidak mengandung teks yang valid.");
        }
        
        // Clean up the generated text
        const cleanedPromptResult = generatedText
          .replace(/```/g, '')
          .replace(/^prompt:/i, '')
          .replace(/^generated prompt:/i, '')
          .trim();
        
        setEnhancedPrompt(generatedText);
        setCleanedPrompt(cleanedPromptResult);
        setShowResult(true);
        
        // Show success toast
        addToast({
          title: "Prompt berhasil dibuat",
          description: "Prompt telah berhasil disempurnakan",
          color: "success",
        });
      } catch (apiError) {
        console.error("API call error:", apiError);
        throw apiError; // Re-throw to be caught by outer try-catch
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      
      // Handle different error types with more specific messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        handleError(
          "Gagal membuat prompt", 
          "Terjadi kesalahan jaringan. Periksa koneksi internet Anda dan coba lagi."
        );
      } else if (error instanceof Error && error.message.includes('API')) {
        handleError(
          "Gagal membuat prompt", 
          error.message || "Terjadi kesalahan saat menyempurnakan prompt. Coba lagi nanti."
        );
      } else if (error instanceof Error && error.message.includes('Batas penggunaan')) {
        handleError(
          "Batas penggunaan API tercapai", 
          "Sistem sedang sibuk. Silakan coba lagi dalam beberapa menit."
        );
      } else if (error instanceof Error && error.message.includes('tidak valid')) {
        handleError(
          "Input tidak valid", 
          "Periksa kembali input Anda dan coba lagi."
        );
      } else {
        handleError(
          "Gagal membuat prompt", 
          "Terjadi kesalahan saat menyempurnakan prompt. Silakan coba lagi."
        );
      }
      
      // Set fallback prompt for better UX
      setEnhancedPrompt("Terjadi kesalahan saat menyempurnakan prompt. Silakan coba lagi.");
      setCleanedPrompt("Terjadi kesalahan saat menyempurnakan prompt. Silakan coba lagi.");
      setShowResult(false); // Don't show result on error
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a retry button function
  const handleRetry = () => {
    setError({ title: "", message: "", visible: false });
    setShowResult(false);
    enhancePromptWithGemini(); // Retry the API call
  };
  
  // Function to handle reset button click
  const handleReset = () => {
    setSelectedType(initialStates.selectedType);
    setSelectedImageType(initialStates.selectedImageType);
    setSelectedStyle(initialStates.selectedStyle);
    setSelectedAspectRatio(initialStates.selectedAspectRatio);
    setSelectedLocation(initialStates.selectedLocation);
    setSelectedMood(initialStates.selectedMood);
    setSelectedTime(initialStates.selectedTime);
    setSelectedWeather(initialStates.selectedWeather);
    setSelectedAccessories(initialStates.selectedAccessories);
    setSelectedEmotion(initialStates.selectedEmotion);
    setSelectedResolution(initialStates.selectedResolution);
    setSelectedCameraAngle(initialStates.selectedCameraAngle);
    setSelectedBackground(initialStates.selectedBackground);
    setPromptText(initialStates.promptText);
    setEnhancedPrompt(initialStates.enhancedPrompt);
    setCleanedPrompt(initialStates.cleanedPrompt);
    setIsLoading(initialStates.isLoading);
    setShowResult(initialStates.showResult);
    setUploadedImage(initialStates.uploadedImage);
    setImagePreview(initialStates.imagePreview);
    setManualInputs(initialStates.manualInputs);
    setImageAnalysis(initialStates.imageAnalysis);
    setError(initialStates.error);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Optionally reset history (uncomment if needed)
    // setPromptHistory([]);
    // localStorage.removeItem('jarvxPromptHistory');
    
    addToast({
      title: "Pengaturan direset",
      description: "Semua pengaturan telah dikembalikan ke default",
      color: "success",
    });
  };
  
  // Render error alert
  const renderError = () => {
    if (!error.visible) return null;
    
    return (
      <Alert 
        color="danger" 
        className="mb-4 font-poppins"
        onClose={() => setError({ ...error, visible: false })}
      >
        <div className="flex items-start gap-2">
          <Icon icon="lucide:alert-triangle" className="mt-1" />
          <div>
            <p className="font-semibold">{error.title}</p>
            <p>{error.message}</p>
            <Button 
              size="sm" 
              variant="light" 
              color="danger" 
              className="mt-1 p-0 h-auto" 
              onPress={handleRetry}
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </Alert>
    );
  };
  
  // Render image analysis results
  const renderImageAnalysis = () => {
    if (!imageAnalysis) return null;
    
    return (
      <div className="mt-4 p-3 bg-content2/30 rounded-lg border border-default-200">
        <p className="text-sm font-semibold text-default-700 mb-2 font-poppins">Hasil Analisis Gambar Referensi:</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-tiny text-default-600 font-apple">
          <p><strong>Subjek:</strong> {imageAnalysis.subject}</p>
          <p><strong>Gaya:</strong> {imageAnalysis.style}</p>
          <p><strong>Komposisi:</strong> {imageAnalysis.composition}</p>
          <p><strong>Pencahayaan:</strong> {imageAnalysis.lighting}</p>
          <p><strong>Suasana:</strong> {imageAnalysis.mood}</p>
          <p><strong>Perspektif:</strong> {imageAnalysis.perspective}</p>
          <div className="col-span-2">
            <strong>Warna Dominan:</strong>
            <div className="flex gap-1 mt-1">
              {imageAnalysis.colors.map((color, index) => (
                <Tooltip key={index} content={color}>
                  <div 
                    className="w-4 h-4 rounded-full border border-default-300"
                    style={{ backgroundColor: color }}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
          {imageAnalysis.details && imageAnalysis.details.length > 0 && (
            <div className="col-span-2">
              <strong>Detail Penting:</strong>
              <ul className="list-disc list-inside ml-1">
                {imageAnalysis.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render image upload section
  const renderImageUpload = () => {
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          setUploadedImage(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
          };
          reader.readAsDataURL(file);
          analyzeImageWithGemini(file);
        } else {
          addToast({
            title: "Format file tidak didukung",
            description: "Silakan unggah file gambar",
            color: "danger",
          });
        }
      }
    };
    
    return (
      <div className="mb-4">
        <p className="text-sm text-default-500 mb-2 font-poppins">Gambar Referensi (Opsional)</p>
        <div 
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${imagePreview ? 'border-primary/50 bg-primary/5' : 'border-default-300 hover:border-primary/30 hover:bg-default-100/50'}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: 'pointer' }}
        >
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="mx-auto max-h-48 rounded-md object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                <Button 
                  isIconOnly 
                  color="danger" 
                  variant="flat" 
                  size="sm"
                  className="absolute top-2 right-2"
                  onPress={() => {
                    removeUploadedImage();
                    setImageAnalysis(null);
                  }}
                >
                  <Icon icon="lucide:x" />
                </Button>
                <p className="text-white text-sm">Klik untuk ganti gambar</p>
              </div>
              <p className="mt-2 text-default-500 font-apple text-sm">
                {uploadedImage?.name} ({Math.round(uploadedImage?.size / 1024)} KB)
              </p>
            </div>
          ) : (
            <>
              <Icon icon="lucide:upload" className="mx-auto mb-2 text-3xl text-default-400" />
              <p className="text-default-500 font-apple text-sm">
                Seret gambar ke sini atau klik untuk mengunggah
              </p>
              <Button 
                className="mt-2" 
                variant="flat" 
                size="sm"
                onPress={() => {
                  fileInputRef.current?.click();
                }}
              >
                Pilih File
              </Button>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
        <p className="mt-1 text-tiny text-default-400 text-center">
          Format: JPG, PNG, GIF, WEBP | Maks: 5MB
        </p>
        
        {renderImageAnalysis()}
      </div>
    );
  };
  
  // Render image options with dropdowns organized in accordions
  const renderImageOptions = () => {
    return (
      <>
        {renderImageUpload()} {/* Add image upload here */}
        <Accordion className="mb-4">
          <AccordionItem 
            key="main-settings" 
            aria-label="Pengaturan Utama" 
            title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:settings" className="text-primary" />
                <span className="font-semibold">Pengaturan Utama</span>
              </div>
            }
            subtitle="Pengaturan dasar untuk generate gambar"
            className="font-poppins"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Select 
                  label="Jenis Gambar" 
                  placeholder="Pilih jenis gambar"
                  selectedKeys={selectedImageType}
                  onSelectionChange={setSelectedImageType as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="portrait" value="portrait">Potret Manusia</SelectItem>
                  <SelectItem key="landscape" value="landscape">Pemandangan Alam</SelectItem>
                  <SelectItem key="sketch" value="sketch">Sketsa</SelectItem>
                  <SelectItem key="illustration" value="illustration">Ilustrasi (Manual & Digital)</SelectItem>
                  <SelectItem key="oil_painting" value="oil_painting">Lukisan Cat Minyak</SelectItem>
                  <SelectItem key="acrylic_painting" value="acrylic_painting">Lukisan Akrilik</SelectItem>
                  <SelectItem key="watercolor" value="watercolor">Lukisan Cat Air</SelectItem>
                  <SelectItem key="pencil_drawing" value="pencil_drawing">Gambar Pensil</SelectItem>
                  <SelectItem key="charcoal_drawing" value="charcoal_drawing">Gambar Arang</SelectItem>
                  <SelectItem key="vector" value="vector">Vektor</SelectItem>
                  <SelectItem key="pixel_art" value="pixel_art">Pixel Art</SelectItem>
                  <SelectItem key="photography" value="photography">Fotografi</SelectItem>
                  <SelectItem key="collage" value="collage">Kolase</SelectItem>
                  <SelectItem key="montage" value="montage">Montase</SelectItem>
                  <SelectItem key="silhouette" value="silhouette">Siluet</SelectItem>
                  <SelectItem key="typography" value="typography">Tipografi / Lettering</SelectItem>
                  <SelectItem key="flat_design" value="flat_design">Flat Design</SelectItem>
                  <SelectItem key="realism" value="realism">Realisme</SelectItem>
                  <SelectItem key="surrealism" value="surrealism">Surrealisme</SelectItem>
                  <SelectItem key="abstract" value="abstract">Abstrak</SelectItem>
                  <SelectItem key="doodle_art" value="doodle_art">Doodle Art</SelectItem>
                  <SelectItem key="line_art" value="line_art">Line Art</SelectItem>
                  <SelectItem key="infographic" value="infographic">Infografis</SelectItem>
                  <SelectItem key="diagram" value="diagram">Diagram (Flowchart, Organigram)</SelectItem>
                  <SelectItem key="map" value="map">Peta</SelectItem>
                  <SelectItem key="floor_plan" value="floor_plan">Denah / Tata Ruang</SelectItem>
                  <SelectItem key="blueprint" value="blueprint">Blueprint</SelectItem>
                  <SelectItem key="mind_map" value="mind_map">Mind Map</SelectItem>
                  <SelectItem key="medical_illustration" value="medical_illustration">Ilustrasi Medis / Anatomi</SelectItem>
                  <SelectItem key="technical_drawing" value="technical_drawing">Gambar Teknik Mesin / Sipil</SelectItem>
                  <SelectItem key="manual_illustration" value="manual_illustration">Gambar Petunjuk (Manual)</SelectItem>
                  <SelectItem key="data_visualization" value="data_visualization">Visualisasi Data</SelectItem>
                  <SelectItem key="traditional_media" value="traditional_media">Media Tradisional</SelectItem>
                  <SelectItem key="digital_media" value="digital_media">Media Digital</SelectItem>
                  <SelectItem key="3d_digital" value="3d_digital">Gambar 3D Digital</SelectItem>
                  <SelectItem key="ai_generated" value="ai_generated">Gambar AI-Generated</SelectItem>
                  <SelectItem key="fine_art" value="fine_art">Gambar Seni Rupa</SelectItem>
                  <SelectItem key="entertainment" value="entertainment">Gambar Hiburan / Estetika</SelectItem>
                  <SelectItem key="promotional" value="promotional">Gambar Promosi / Iklan</SelectItem>
                  <SelectItem key="educational" value="educational">Gambar Edukasi</SelectItem>
                  <SelectItem key="branding" value="branding">Branding (Logo, Maskot)</SelectItem>
                  <SelectItem key="product_illustration" value="product_illustration">Ilustrasi Produk</SelectItem>
                  <SelectItem key="comic" value="comic">Komik</SelectItem>
                  <SelectItem key="caricature" value="caricature">Karikatur</SelectItem>
                  <SelectItem key="cartoon" value="cartoon">Kartun</SelectItem>
                  <SelectItem key="manga" value="manga">Manga</SelectItem>
                  <SelectItem key="webtoon" value="webtoon">Webtoon</SelectItem>
                  <SelectItem key="storyboard" value="storyboard">Storyboard</SelectItem>
                  <SelectItem key="poster" value="poster">Poster</SelectItem>
                  <SelectItem key="brochure" value="brochure">Brosur / Flyer</SelectItem>
                  <SelectItem key="banner" value="banner">Banner / Spanduk</SelectItem>
                  <SelectItem key="product_mockup" value="product_mockup">Mockup Produk</SelectItem>
                  <SelectItem key="ui_design" value="ui_design">Desain UI</SelectItem>
                  <SelectItem key="youtube_thumbnail" value="youtube_thumbnail">Thumbnail YouTube</SelectItem>
                  <SelectItem key="cover" value="cover">Cover Buku / Album</SelectItem>
                  <SelectItem key="psychology_image" value="psychology_image">Gambar Psikologi</SelectItem>
                  <SelectItem key="architecture" value="architecture">Gambar Arsitektur</SelectItem>
                  <SelectItem key="3d_rendering" value="3d_rendering">Rendering 3D Arsitektur</SelectItem>
                  <SelectItem key="game_sprite" value="game_sprite">Sprite (Game)</SelectItem>
                  <SelectItem key="character_design" value="character_design">Karakter (Character Design)</SelectItem>
                  <SelectItem key="background" value="background">Background (Latar)</SelectItem>
                  <SelectItem key="concept_art" value="concept_art">Concept Art</SelectItem>
                  <SelectItem key="matte_painting" value="matte_painting">Matte Painting</SelectItem>
                  <SelectItem key="ai_enhanced" value="ai_enhanced">AI Photo Enhancement</SelectItem>
                  <SelectItem key="deepfake" value="deepfake">Deepfake Image</SelectItem>
                  <SelectItem key="neural_style" value="neural_style">Neural Style Transfer</SelectItem>
                  <SelectItem key="prompt_based" value="prompt_based">Prompt-based AI Image</SelectItem>
                  <SelectItem key="ai_storyboard" value="ai_storyboard">AI-Generated Storyboard</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan jenis gambar manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.imageType}
                  onValueChange={(value) => handleManualInputChange("imageType", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
              
              <div>
                <Select 
                  label="Gaya Artistik" 
                  placeholder="Pilih gaya visual"
                  selectedKeys={selectedStyle}
                  onSelectionChange={setSelectedStyle as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="digital_art" value="digital_art">Seni Digital</SelectItem>
                  <SelectItem key="realistic" value="realistic">Realistis</SelectItem>
                  <SelectItem key="impressionism" value="impressionism">Impresionisme</SelectItem>
                  <SelectItem key="expressionism" value="expressionism">Ekspresionisme</SelectItem>
                  <SelectItem key="cubism" value="cubism">Kubisme</SelectItem>
                  <SelectItem key="surrealism" value="surrealism">Surealisme</SelectItem>
                  <SelectItem key="abstract" value="abstract">Abstrak</SelectItem>
                  <SelectItem key="baroque" value="baroque">Barok</SelectItem>
                  <SelectItem key="renaissance" value="renaissance">Renaisans</SelectItem>
                  <SelectItem key="pop_art" value="pop_art">Pop Art</SelectItem>
                  <SelectItem key="minimalism" value="minimalism">Minimalisme</SelectItem>
                  <SelectItem key="romanticism" value="romanticism">Romantisisme</SelectItem>
                  <SelectItem key="art_nouveau" value="art_nouveau">Art Nouveau</SelectItem>
                  <SelectItem key="fauvism" value="fauvism">Fauvisme</SelectItem>
                  <SelectItem key="dadaism" value="dadaism">Dadaisme</SelectItem>
                  <SelectItem key="constructivism" value="constructivism">Konstruktivisme</SelectItem>
                  <SelectItem key="futurism" value="futurism">Futurisme</SelectItem>
                  <SelectItem key="symbolism" value="symbolism">Simbolisme</SelectItem>
                  <SelectItem key="neoclassical" value="neoclassical">Neoklasik</SelectItem>
                  <SelectItem key="gothic" value="gothic">Gotik</SelectItem>
                  <SelectItem key="post_impressionism" value="post_impressionism">Post-Impresionisme</SelectItem>
                  <SelectItem key="op_art" value="op_art">Op Art</SelectItem>
                  <SelectItem key="color_field" value="color_field">Color Field</SelectItem>
                  <SelectItem key="photorealism" value="photorealism">Fotorealisme</SelectItem>
                  <SelectItem key="brutalism" value="brutalism">Brutalisme</SelectItem>
                  <SelectItem key="bauhaus" value="bauhaus">Bauhaus</SelectItem>
                  <SelectItem key="rococo" value="rococo">Rokoko</SelectItem>
                  <SelectItem key="suprematism" value="suprematism">Suprematisme</SelectItem>
                  <SelectItem key="art_deco" value="art_deco">Art Deco</SelectItem>
                  <SelectItem key="tonalism" value="tonalism">Tonalisme</SelectItem>
                  <SelectItem key="luminism" value="luminism">Luminisme</SelectItem>
                  <SelectItem key="contemporary_art" value="contemporary_art">Seni Kontemporer</SelectItem>
                  <SelectItem key="popular_art" value="popular_art">Seni Populer</SelectItem>
                  <SelectItem key="street_art" value="street_art">Seni Jalanan (Street Art)</SelectItem>
                  <SelectItem key="neo_expressionism" value="neo_expressionism">Neo-ekspresionisme</SelectItem>
                  <SelectItem key="kinetic_art" value="kinetic_art">Kinetik</SelectItem>
                  <SelectItem key="installation_art" value="installation_art">Instalasi</SelectItem>
                  <SelectItem key="performance_art" value="performance_art">Performance Art</SelectItem>
                  <SelectItem key="graffiti" value="graffiti">Graffiti</SelectItem>
                  <SelectItem key="hyperrealism" value="hyperrealism">Hyperrealisme</SelectItem>
                  <SelectItem key="cartoon" value="cartoon">Kartun</SelectItem>
                  <SelectItem key="anime" value="anime">Anime</SelectItem>
                  <SelectItem key="manga" value="manga">Manga</SelectItem>
                  <SelectItem key="pixel_art" value="pixel_art">Seni Piksel</SelectItem>
                  <SelectItem key="3d_render" value="3d_render">Render 3D</SelectItem>
                  <SelectItem key="vector" value="vector">Vektor</SelectItem>
                  <SelectItem key="watercolor" value="watercolor">Cat Air</SelectItem>
                  <SelectItem key="oil_painting" value="oil_painting">Lukisan Minyak</SelectItem>
                  <SelectItem key="pencil_sketch" value="pencil_sketch">Sketsa Pensil</SelectItem>
                  <SelectItem key="charcoal" value="charcoal">Sketsa Arang</SelectItem>
                  <SelectItem key="flat_design" value="flat_design">Desain Datar</SelectItem>
                  <SelectItem key="isometric" value="isometric">Isometrik</SelectItem>
                  <SelectItem key="low_poly" value="low_poly">Low Poly</SelectItem>
                  <SelectItem key="cyberpunk" value="cyberpunk">Cyberpunk</SelectItem>
                  <SelectItem key="steampunk" value="steampunk">Steampunk</SelectItem>
                  <SelectItem key="vaporwave" value="vaporwave">Gaya Vaporwave</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan gaya manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.style}
                  onValueChange={(value) => handleManualInputChange("style", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Select 
                  label="Rasio Aspek" 
                  placeholder="Pilih rasio aspek"
                  selectedKeys={selectedAspectRatio}
                  onSelectionChange={setSelectedAspectRatio as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="1:1" value="1:1">1:1 (Persegi)</SelectItem>
                  <SelectItem key="16:9" value="16:9">16:9 (Lanskap)</SelectItem>
                  <SelectItem key="9:16" value="9:16">9:16 (Potret)</SelectItem>
                  <SelectItem key="4:3" value="4:3">4:3 (Tradisional)</SelectItem>
                  <SelectItem key="3:4" value="3:4">3:4 (Potret Tradisional)</SelectItem>
                  <SelectItem key="21:9" value="21:9">21:9 (Ultrawide)</SelectItem>
                  <SelectItem key="3:2" value="3:2">3:2 (Fotografi)</SelectItem>
                  <SelectItem key="2:3" value="2:3">2:3 (Potret Fotografi)</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan rasio aspek manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.aspectRatio}
                  onValueChange={(value) => handleManualInputChange("aspectRatio", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
              
              <div>
                <Select 
                  label="Resolusi Gambar" 
                  placeholder="Pilih resolusi"
                  selectedKeys={selectedResolution}
                  onSelectionChange={setSelectedResolution as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="4k" value="4k">4K</SelectItem>
                  <SelectItem key="2k" value="2k">2K</SelectItem>
                  <SelectItem key="fhd" value="fhd">Full HD</SelectItem>
                  <SelectItem key="hd" value="hd">HD</SelectItem>
                  <SelectItem key="sd" value="sd">SD</SelectItem>
                  <SelectItem key="8k" value="8k">8K</SelectItem>
                  <SelectItem key="high_res" value="high_res">Resolusi Tinggi</SelectItem>
                  <SelectItem key="low_res" value="low_res">Resolusi Rendah</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan resolusi manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.resolution}
                  onValueChange={(value) => handleManualInputChange("resolution", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
            </div>
          </AccordionItem>
          
          <AccordionItem 
            key="environment-settings" 
            aria-label="Pengaturan Lingkungan" 
            title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:map-pin" className="text-primary" />
                <span className="font-semibold">Pengaturan Lingkungan</span>
              </div>
            }
            subtitle="Lokasi, waktu, cuaca, dan suasana"
            className="font-poppins"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Select 
                  label="Lokasi" 
                  placeholder="Pilih lokasi"
                  selectedKeys={selectedLocation}
                  onSelectionChange={setSelectedLocation as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="none" value="none">Tidak Ditentukan</SelectItem>
                  <SelectItem key="city" value="city">Kota</SelectItem>
                  <SelectItem key="forest" value="forest">Hutan</SelectItem>
                  <SelectItem key="beach" value="beach">Pantai</SelectItem>
                  <SelectItem key="mountain" value="mountain">Gunung</SelectItem>
                  <SelectItem key="desert" value="desert">Gurun</SelectItem>
                  <SelectItem key="space" value="space">Luar Angkasa</SelectItem>
                  <SelectItem key="underwater" value="underwater">Bawah Air</SelectItem>
                  <SelectItem key="indoor" value="indoor">Dalam Ruangan</SelectItem>
                  <SelectItem key="outdoor" value="outdoor">Luar Ruangan</SelectItem>
                  <SelectItem key="futuristic_city" value="futuristic_city">Kota Futuristik</SelectItem>
                  <SelectItem key="fantasy_realm" value="fantasy_realm">Dunia Fantasi</SelectItem>
                  <SelectItem key="historical_setting" value="historical_setting">Setting Sejarah</SelectItem>
                  <SelectItem key="cyberpunk_city" value="cyberpunk_city">Kota Cyberpunk</SelectItem>
                  <SelectItem key="steampunk_world" value="steampunk_world">Dunia Steampunk</SelectItem>
                  <SelectItem key="post_apocalyptic" value="post_apocalyptic">Post-Apokaliptik</SelectItem>
                  <SelectItem key="tropical_island" value="tropical_island">Pulau Tropis</SelectItem>
                  <SelectItem key="arctic_landscape" value="arctic_landscape">Pemandangan Arktik</SelectItem>
                  <SelectItem key="volcanic_area" value="volcanic_area">Area Vulkanik</SelectItem>
                  <SelectItem key="rural_village" value="rural_village">Desa Pedesaan</SelectItem>
                  <SelectItem key="urban_street" value="urban_street">Jalanan Perkotaan</SelectItem>
                  <SelectItem key="ancient_ruins" value="ancient_ruins">Reruntuhan Kuno</SelectItem>
                  <SelectItem key="haunted_house" value="haunted_house">Rumah Hantu</SelectItem>
                  <SelectItem key="library" value="library">Perpustakaan</SelectItem>
                  <SelectItem key="laboratory" value="laboratory">Laboratorium</SelectItem>
                  <SelectItem key="factory" value="factory">Pabrik</SelectItem>
                  <SelectItem key="castle" value="castle">Kastil</SelectItem>
                  <SelectItem key="temple" value="temple">Kuil</SelectItem>
                  <SelectItem key="market" value="market">Pasar</SelectItem>
                  <SelectItem key="school" value="school">Sekolah</SelectItem>
                  <SelectItem key="hospital" value="hospital">Rumah Sakit</SelectItem>
                  <SelectItem key="office" value="office">Kantor</SelectItem>
                  <SelectItem key="park" value="park">Taman</SelectItem>
                  <SelectItem key="stadium" value="stadium">Stadion</SelectItem>
                  <SelectItem key="airport" value="airport">Bandara</SelectItem>
                  <SelectItem key="train_station" value="train_station">Stasiun Kereta</SelectItem>
                  <SelectItem key="ship" value="ship">Kapal</SelectItem>
                  <SelectItem key="airplane" value="airplane">Pesawat</SelectItem>
                  <SelectItem key="car" value="car">Mobil</SelectItem>
                  <SelectItem key="train" value="train">Kereta</SelectItem>
                  <SelectItem key="bus" value="bus">Bus</SelectItem>
                  <SelectItem key="motorcycle" value="motorcycle">Motor</SelectItem>
                  <SelectItem key="bicycle" value="bicycle">Sepeda</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan lokasi manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.location}
                  onValueChange={(value) => handleManualInputChange("location", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
              
              <div>
                <Select 
                  label="Suasana / Mood" 
                  placeholder="Pilih suasana"
                  selectedKeys={selectedMood}
                  onSelectionChange={setSelectedMood as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="none" value="none">Tidak Ditentukan</SelectItem>
                  <SelectItem key="cheerful" value="cheerful">Ceria</SelectItem>
                  <SelectItem key="melancholic" value="melancholic">Melankolis</SelectItem>
                  <SelectItem key="peaceful" value="peaceful">Damai</SelectItem>
                  <SelectItem key="dramatic" value="dramatic">Dramatis</SelectItem>
                  <SelectItem key="mystic" value="mystic">Misterius</SelectItem>
                  <SelectItem key="dark" value="dark">Gelap</SelectItem>
                  <SelectItem key="romantic" value="romantic">Romantis</SelectItem>
                  <SelectItem key="epic" value="epic">Epik</SelectItem>
                  <SelectItem key="nostalgic" value="nostalgic">Nostalgia</SelectItem>
                  <SelectItem key="energetic" value="energetic">Energetik</SelectItem>
                  <SelectItem key="tense" value="tense">Tegang</SelectItem>
                  <SelectItem key="dreamy" value="dreamy">Seperti Mimpi</SelectItem>
                  <SelectItem key="whimsical" value="whimsical">Aneh / Unik</SelectItem>
                  <SelectItem key="serene" value="serene">Tenang</SelectItem>
                  <SelectItem key="chaotic" value="chaotic">Kacau</SelectItem>
                  <SelectItem key="hopeful" value="hopeful">Penuh Harapan</SelectItem>
                  <SelectItem key="desperate" value="desperate">Putus Asa</SelectItem>
                  <SelectItem key="joyful" value="joyful">Gembira</SelectItem>
                  <SelectItem key="suspenseful" value="suspenseful">Mencekam</SelectItem>
                  <SelectItem key="eerie" value="eerie">Menyeramkan</SelectItem>
                  <SelectItem key="cozy" value="cozy">Nyaman</SelectItem>
                  <SelectItem key="grand" value="grand">Megah</SelectItem>
                  <SelectItem key="intimate" value="intimate">Intim</SelectItem>
                  <SelectItem key="lonely" value="lonely">Kesepian</SelectItem>
                  <SelectItem key="playful" value="playful">Bercanda</SelectItem>
                  <SelectItem key="serious" value="serious">Serius</SelectItem>
                  <SelectItem key="surreal" value="surreal">Surealis</SelectItem>
                  <SelectItem key="vintage" value="vintage">Vintage</SelectItem>
                  <SelectItem key="modern" value="modern">Modern</SelectItem>
                  <SelectItem key="futuristic" value="futuristic">Futuristik</SelectItem>
                  <SelectItem key="retro" value="retro">Retro</SelectItem>
                  <SelectItem key="gothic" value="gothic">Gotik</SelectItem>
                  <SelectItem key="cyberpunk" value="cyberpunk">Cyberpunk</SelectItem>
                  <SelectItem key="steampunk" value="steampunk">Steampunk</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan suasana manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.mood}
                  onValueChange={(value) => handleManualInputChange("mood", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Select 
                  label="Waktu" 
                  placeholder="Pilih waktu"
                  selectedKeys={selectedTime}
                  onSelectionChange={setSelectedTime as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="none" value="none">Tidak Ditentukan</SelectItem>
                  <SelectItem key="day" value="day">Siang Hari</SelectItem>
                  <SelectItem key="night" value="night">Malam Hari</SelectItem>
                  <SelectItem key="sunrise" value="sunrise">Matahari Terbit</SelectItem>
                  <SelectItem key="sunset" value="sunset">Matahari Terbenam</SelectItem>
                  <SelectItem key="golden_hour" value="golden_hour">Golden Hour</SelectItem>
                  <SelectItem key="blue_hour" value="blue_hour">Blue Hour</SelectItem>
                  <SelectItem key="midday" value="midday">Tengah Hari</SelectItem>
                  <SelectItem key="midnight" value="midnight">Tengah Malam</SelectItem>
                  <SelectItem key="dawn" value="dawn">Fajar</SelectItem>
                  <SelectItem key="dusk" value="dusk">Senja</SelectItem>
                  <SelectItem key="afternoon" value="afternoon">Sore Hari</SelectItem>
                  <SelectItem key="morning" value="morning">Pagi Hari</SelectItem>
                  <SelectItem key="twilight" value="twilight">Twilight</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan waktu manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.time}
                  onValueChange={(value) => handleManualInputChange("time", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
              
              <div>
                <Select 
                  label="Cuaca" 
                  placeholder="Pilih cuaca"
                  selectedKeys={selectedWeather}
                  onSelectionChange={setSelectedWeather as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="none" value="none">Tidak Ditentukan</SelectItem>
                  <SelectItem key="sunny" value="sunny">Cerah</SelectItem>
                  <SelectItem key="cloudy" value="cloudy">Berawan</SelectItem>
                  <SelectItem key="rainy" value="rainy">Hujan</SelectItem>
                  <SelectItem key="stormy" value="stormy">Badai</SelectItem>
                  <SelectItem key="snowy" value="snowy">Bersalju</SelectItem>
                  <SelectItem key="foggy" value="foggy">Berkabut</SelectItem>
                  <SelectItem key="windy" value="windy">Berangin</SelectItem>
                  <SelectItem key="overcast" value="overcast">Mendung</SelectItem>
                  <SelectItem key="hail" value="hail">Hujan Es</SelectItem>
                  <SelectItem key="sleet" value="sleet">Hujan Salju</SelectItem>
                  <SelectItem key="thunderstorm" value="thunderstorm">Badai Petir</SelectItem>
                  <SelectItem key="tornado" value="tornado">Tornado</SelectItem>
                  <SelectItem key="hurricane" value="hurricane">Badai Topan</SelectItem>
                  <SelectItem key="blizzard" value="blizzard">Badai Salju</SelectItem>
                  <SelectItem key="sandstorm" value="sandstorm">Badai Pasir</SelectItem>
                  <SelectItem key="dust_storm" value="dust_storm">Badai Debu</SelectItem>
                  <SelectItem key="clear_sky" value="clear_sky">Langit Cerah</SelectItem>
                  <SelectItem key="partly_cloudy" value="partly_cloudy">Sebagian Berawan</SelectItem>
                  <SelectItem key="heavy_rain" value="heavy_rain">Hujan Lebat</SelectItem>
                  <SelectItem key="light_rain" value="light_rain">Hujan Ringan</SelectItem>
                  <SelectItem key="drizzle" value="drizzle">Gerimis</SelectItem>
                  <SelectItem key="mist" value="mist">Kabut Tipis</SelectItem>
                  <SelectItem key="haze" value="haze">Kabut Asap</SelectItem>
                  <SelectItem key="rainbow" value="rainbow">Pelangi</SelectItem>
                  <SelectItem key="aurora" value="aurora">Aurora</SelectItem>
                  <SelectItem key="meteor_shower" value="meteor_shower">Hujan Meteor</SelectItem>
                  <SelectItem key="eclipse" value="eclipse">Gerhana</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan cuaca manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.weather}
                  onValueChange={(value) => handleManualInputChange("weather", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
            </div>
          </AccordionItem>
          
          <AccordionItem 
            key="character-settings" 
            aria-label="Pengaturan Karakter" 
            title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:user" className="text-primary" />
                <span className="font-semibold">Pengaturan Karakter</span>
              </div>
            }
            subtitle="Aksesori dan emosi karakter"
            className="font-poppins"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Select 
                  label="Aksesori / Objek" 
                  placeholder="Pilih aksesori"
                  selectedKeys={selectedAccessories}
                  onSelectionChange={setSelectedAccessories as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="none" value="none">Tidak Ditentukan</SelectItem>
                  <SelectItem key="glasses" value="glasses">Kacamata</SelectItem>
                  <SelectItem key="hat" value="hat">Topi</SelectItem>
                  <SelectItem key="scarf" value="scarf">Syal</SelectItem>
                  <SelectItem key="jewelry" value="jewelry">Perhiasan</SelectItem>
                  <SelectItem key="weapon" value="weapon">Senjata</SelectItem>
                  <SelectItem key="book" value="book">Buku</SelectItem>
                  <SelectItem key="musical_instrument" value="musical_instrument">Alat Musik</SelectItem>
                  <SelectItem key="backpack" value="backpack">Ransel</SelectItem>
                  <SelectItem key="umbrella" value="umbrella">Payung</SelectItem>
                  <SelectItem key="headphones" value="headphones">Headphone</SelectItem>
                  <SelectItem key="camera" value="camera">Kamera</SelectItem>
                  <SelectItem key="phone" value="phone">Telepon</SelectItem>
                  <SelectItem key="laptop" value="laptop">Laptop</SelectItem>
                  <SelectItem key="coffee_cup" value="coffee_cup">Cangkir Kopi</SelectItem>
                  <SelectItem key="tea_cup" value="tea_cup">Cangkir Teh</SelectItem>
                  <SelectItem key="wine_glass" value="wine_glass">Gelas Anggur</SelectItem>
                  <SelectItem key="beer_mug" value="beer_mug">Mug Bir</SelectItem>
                  <SelectItem key="sword" value="sword">Pedang</SelectItem>
                  <SelectItem key="shield" value="shield">Perisai</SelectItem>
                  <SelectItem key="bow_arrow" value="bow_arrow">Panah & Busur</SelectItem>
                  <SelectItem key="magic_wand" value="magic_wand">Tongkat Sihir</SelectItem>
                  <SelectItem key="staff" value="staff">Tongkat</SelectItem>
                  <SelectItem key="lantern" value="lantern">Lentera</SelectItem>
                  <SelectItem key="torch" value="torch">Obor</SelectItem>
                  <SelectItem key="map" value="map">Peta</SelectItem>
                  <SelectItem key="compass" value="compass">Kompas</SelectItem>
                  <SelectItem key="telescope" value="telescope">Teleskop</SelectItem>
                  <SelectItem key="microscope" value="microscope">Mikroskop</SelectItem>
                  <SelectItem key="magnifying_glass" value="magnifying_glass">Kaca Pembesar</SelectItem>
                  <SelectItem key="key" value="key">Kunci</SelectItem>
                  <SelectItem key="lock" value="lock">Gembok</SelectItem>
                  <SelectItem key="chains" value="chains">Rantai</SelectItem>
                  <SelectItem key="armor" value="armor">Armor</SelectItem>
                  <SelectItem key="helmet" value="helmet">Helm</SelectItem>
                  <SelectItem key="leather_jacket" value="leather_jacket">Jaket Kulit</SelectItem>
                  <SelectItem key="face_mask" value="face_mask">Masker Wajah</SelectItem>
                  <SelectItem key="luxury_jewelry" value="luxury_jewelry">Perhiasan Mewah</SelectItem>
                  <SelectItem key="flying_scarf" value="flying_scarf">Syal Terbang</SelectItem>
                  <SelectItem key="old_camera" value="old_camera">Kamera Tua</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan aksesori manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.accessories}
                  onValueChange={(value) => handleManualInputChange("accessories", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
              
              <div>
                <Select 
                  label="Emosi / Ekspresi" 
                  placeholder="Pilih ekspresi emosi"
                  selectedKeys={selectedEmotion}
                  onSelectionChange={setSelectedEmotion as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="none" value="none">Tidak Ditentukan</SelectItem>
                  <SelectItem key="happy" value="happy">Bahagia</SelectItem>
                  <SelectItem key="sad" value="sad">Sedih</SelectItem>
                  <SelectItem key="angry" value="angry">Marah</SelectItem>
                  <SelectItem key="afraid" value="afraid">Takut</SelectItem>
                  <SelectItem key="surprised" value="surprised">Kaget</SelectItem>
                  <SelectItem key="confused" value="confused">Bingung</SelectItem>
                  <SelectItem key="calm" value="calm">Tenang</SelectItem>
                  <SelectItem key="anxious" value="anxious">Cemas</SelectItem>
                  <SelectItem key="love" value="love">Cinta</SelectItem>
                  <SelectItem key="pity" value="pity">Kasihan</SelectItem>
                  <SelectItem key="proud" value="proud">Bangga</SelectItem>
                  <SelectItem key="pouting" value="pouting">Cemberut</SelectItem>
                  <SelectItem key="laughing" value="laughing">Tertawa</SelectItem>
                  <SelectItem key="contemplative" value="contemplative">Merenung</SelectItem>
                  <SelectItem key="sleepy" value="sleepy">Mengantuk</SelectItem>
                  <SelectItem key="inspired" value="inspired">Terinspirasi</SelectItem>
                  <SelectItem key="cynical" value="cynical">Sinis</SelectItem>
                  <SelectItem key="enthusiastic" value="enthusiastic">Antusias</SelectItem>
                  <SelectItem key="apathetic" value="apathetic">Apatis</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan emosi manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.emotion}
                  onValueChange={(value) => handleManualInputChange("emotion", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
            </div>
          </AccordionItem>
          
          <AccordionItem 
            key="technical-settings" 
            aria-label="Pengaturan Teknis" 
            title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:camera" className="text-primary" />
                <span className="font-semibold">Pengaturan Teknis</span>
              </div>
            }
            subtitle="Sudut kamera dan teknik khusus"
            className="font-poppins"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Select 
                  label="Struktur / Komposisi" 
                  placeholder="Pilih sudut kamera"
                  selectedKeys={selectedCameraAngle}
                  onSelectionChange={setSelectedCameraAngle as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="close_up" value="close_up">Close-up</SelectItem>
                  <SelectItem key="wide_shot" value="wide_shot">Wide Shot</SelectItem>
                  <SelectItem key="birds_eye" value="birds_eye">Sudut Pandang dari Atas (Bird's Eye View)</SelectItem>
                  <SelectItem key="worms_eye" value="worms_eye">Sudut Pandang dari Bawah (Worm's Eye View)</SelectItem>
                  <SelectItem key="panorama" value="panorama">Panorama</SelectItem>
                  <SelectItem key="rule_of_thirds" value="rule_of_thirds">Aturan Sepertiga (Rule of Thirds)</SelectItem>
                  <SelectItem key="symmetrical" value="symmetrical">Simetris</SelectItem>
                  <SelectItem key="asymmetrical" value="asymmetrical">Asimetris</SelectItem>
                  <SelectItem key="single_focus" value="single_focus">Fokus Tunggal</SelectItem>
                  <SelectItem key="multi_character" value="multi_character">Banyak Karakter</SelectItem>
                  <SelectItem key="diorama" value="diorama">Diorama</SelectItem>
                  <SelectItem key="eye_level" value="eye_level">Eye Level</SelectItem>
                  <SelectItem key="low_angle" value="low_angle">Low Angle</SelectItem>
                  <SelectItem key="high_angle" value="high_angle">High Angle</SelectItem>
                  <SelectItem key="dutch_angle" value="dutch_angle">Dutch Angle</SelectItem>
                  <SelectItem key="over_shoulder" value="over_shoulder">Over The Shoulder</SelectItem>
                  <SelectItem key="pov" value="pov">POV (Point of View)</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan sudut kamera manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.cameraAngle}
                  onValueChange={(value) => handleManualInputChange("cameraAngle", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
              
              <div>
                <Select 
                  label="Teknik Khusus" 
                  placeholder="Pilih jenis background"
                  selectedKeys={selectedBackground}
                  onSelectionChange={setSelectedBackground as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="with_background" value="with_background">Dengan Background</SelectItem>
                  <SelectItem key="without_background" value="without_background">Tanpa Background (PNG)</SelectItem>
                  <SelectItem key="blur_background" value="blur_background">Background Blur</SelectItem>
                  <SelectItem key="gradient_background" value="gradient_background">Background Gradient</SelectItem>
                  <SelectItem key="solid_background" value="solid_background">Background Solid</SelectItem>
                  <SelectItem key="bokeh_background" value="bokeh_background">Background Bokeh</SelectItem>
                  <SelectItem key="double_exposure" value="double_exposure">Paparan Ganda (Double Exposure)</SelectItem>
                  <SelectItem key="neon_light" value="neon_light">Efek Cahaya Neon</SelectItem>
                  <SelectItem key="motion_blur" value="motion_blur">Gerakan Kabur (Motion Blur)</SelectItem>
                  <SelectItem key="silhouette" value="silhouette">Siluet</SelectItem>
                  <SelectItem key="shadow_play" value="shadow_play">Permainan Bayangan</SelectItem>
                  <SelectItem key="xray" value="xray">Gaya Sinar-X</SelectItem>
                  <SelectItem key="cutaway" value="cutaway">Potongan Silang</SelectItem>
                  <SelectItem key="cross_section" value="cross_section">Potongan Melintang</SelectItem>
                  <SelectItem key="3d_anaglyph" value="3d_anaglyph">Gaya 3D Anaglif</SelectItem>
                  <SelectItem key="paper_cut" value="paper_cut">Gaya Potongan Kertas</SelectItem>
                  <SelectItem key="timelapse" value="timelapse">Komposit Time-lapse</SelectItem>
                  <SelectItem key="tilt_shift" value="tilt_shift">Tilt-shift</SelectItem>
                  <SelectItem key="glitch_art" value="glitch_art">Seni Glitch</SelectItem>
                  <SelectItem key="vaporwave" value="vaporwave">Gaya Vaporwave</SelectItem>
                  <SelectItem key="hologram" value="hologram">Gaya Hologram</SelectItem>
                  <SelectItem key="thermal_vision" value="thermal_vision">Penglihatan Termal</SelectItem>
                  <SelectItem key="night_vision" value="night_vision">Penglihatan Malam</SelectItem>
                </Select>
                <Input
                  placeholder="Atau masukkan teknik khusus manual"
                  size="sm"
                  variant="bordered"
                  value={manualInputs.background}
                  onValueChange={(value) => handleManualInputChange("background", value)}
                  className="w-full"
                  startContent={<Icon icon="lucide:edit-3" className="text-default-400" size={16} />}
                />
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </>
    );
  };
  
  // Render video options with dropdowns organized in accordions
  const renderVideoOptions = () => {
    return (
      <>
        <Accordion className="mb-4">
          <AccordionItem 
            key="main-settings" 
            aria-label="Pengaturan Utama" 
            title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:settings" className="text-primary" />
                <span className="font-semibold">Pengaturan Utama</span>
              </div>
            }
            subtitle="Pengaturan dasar untuk generate video"
            className="font-poppins"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select 
                label="Jenis Video" 
                placeholder="Pilih jenis video"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="animation" value="animation">Animasi</SelectItem>
                <SelectItem key="motion" value="motion">Motion Graphics</SelectItem>
                <SelectItem key="cinematic" value="cinematic">Sinematik</SelectItem>
                <SelectItem key="explainer" value="explainer">Video Penjelasan</SelectItem>
              </Select>
              
              <Select 
                label="Durasi" 
                placeholder="Pilih durasi video"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="short" value="short">Pendek (5-15 detik)</SelectItem>
                <SelectItem key="medium" value="medium">Sedang (15-30 detik)</SelectItem>
                <SelectItem key="long" value="long">Panjang (30-60 detik)</SelectItem>
                <SelectItem key="extended" value="extended">Extended (1-3 menit)</SelectItem>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select 
                label="Gaya Visual" 
                placeholder="Pilih gaya visual"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="realistic" value="realistic">Realistis</SelectItem>
                <SelectItem key="cartoon" value="cartoon">Kartun</SelectItem>
                <SelectItem key="3d" value="3d">3D Render</SelectItem>
                <SelectItem key="stopmotion" value="stopmotion">Stop Motion</SelectItem>
              </Select>
              
              <Select 
                label="Resolusi Video" 
                placeholder="Pilih resolusi video"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="4k" value="4k">4K (3840 x 2160)</SelectItem>
                <SelectItem key="2k" value="2k">2K (2560 x 1440)</SelectItem>
                <SelectItem key="fhd" value="fhd">Full HD (1920 x 1080)</SelectItem>
                <SelectItem key="hd" value="hd">HD (1280 x 720)</SelectItem>
              </Select>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-default-500 mb-2 font-poppins">Audio/Musik</p>
              <RadioGroup orientation="horizontal">
                <Radio value="none">Tanpa Audio</Radio>
                <Radio value="background">Musik Latar</Radio>
                <Radio value="voiceover">Voice Over</Radio>
                <Radio value="both">Musik & Voice Over</Radio>
              </RadioGroup>
            </div>
          </AccordionItem>
          
          <AccordionItem 
            key="advanced-settings" 
            aria-label="Pengaturan Lanjutan" 
            title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:sliders" className="text-primary" />
                <span className="font-semibold">Pengaturan Lanjutan</span>
              </div>
            }
            subtitle="Pengaturan detail untuk hasil yang lebih spesifik"
            className="font-poppins"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select 
                label="Kecepatan" 
                placeholder="Pilih kecepatan video"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="normal" value="normal">Normal</SelectItem>
                <SelectItem key="slow" value="slow">Slow Motion</SelectItem>
                <SelectItem key="fast" value="fast">Fast Motion</SelectItem>
                <SelectItem key="timelapse" value="timelapse">Timelapse</SelectItem>
                <SelectItem key="hyperlapse" value="hyperlapse">Hyperlapse</SelectItem>
              </Select>
              
              <Select 
                label="Transisi" 
                placeholder="Pilih jenis transisi"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="cut" value="cut">Cut</SelectItem>
                <SelectItem key="fade" value="fade">Fade</SelectItem>
                <SelectItem key="dissolve" value="dissolve">Dissolve</SelectItem>
                <SelectItem key="wipe" value="wipe">Wipe</SelectItem>
                <SelectItem key="slide" value="slide">Slide</SelectItem>
                <SelectItem key="zoom" value="zoom">Zoom</SelectItem>
                <SelectItem key="morph" value="morph">Morph</SelectItem>
                <SelectItem key="glitch" value="glitch">Glitch</SelectItem>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select 
                label="Suasana" 
                placeholder="Pilih suasana"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="none" value="none">Tidak Ditentukan</SelectItem>
                <SelectItem key="cheerful" value="cheerful">Ceria</SelectItem>
                <SelectItem key="melancholic" value="melancholic">Melankolis</SelectItem>
                <SelectItem key="peaceful" value="peaceful">Damai</SelectItem>
                <SelectItem key="dramatic" value="dramatic">Dramatis</SelectItem>
                <SelectItem key="mystic" value="mystic">Misterius</SelectItem>
                <SelectItem key="dark" value="dark">Gelap</SelectItem>
                <SelectItem key="romantic" value="romantic">Romantis</SelectItem>
                <SelectItem key="epic" value="epic">Epik</SelectItem>
              </Select>
              
              <Select 
                label="Pencahayaan" 
                placeholder="Pilih pencahayaan"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="natural" value="natural">Alami</SelectItem>
                <SelectItem key="studio" value="studio">Studio</SelectItem>
                <SelectItem key="cinematic" value="cinematic">Sinematik</SelectItem>
                <SelectItem key="low_key" value="low_key">Low Key</SelectItem>
                <SelectItem key="high_key" value="high_key">High Key</SelectItem>
              </Select>
            </div>
          </AccordionItem>
        </Accordion>
      </>
    );
  };
  
  // Render code options with dropdowns organized in accordions
  const renderCodeOptions = () => {
    return (
      <>
        <Accordion className="mb-4">
          <AccordionItem 
            key="main-settings" 
            aria-label="Pengaturan Utama" 
            title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:settings" className="text-primary" />
                <span className="font-semibold">Pengaturan Utama</span>
              </div>
            }
            subtitle="Pengaturan dasar untuk generate kode"
            className="font-poppins"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select 
                label="Bahasa Pemrograman" 
                placeholder="Pilih bahasa"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="javascript" value="javascript">JavaScript</SelectItem>
                <SelectItem key="python" value="python">Python</SelectItem>
                <SelectItem key="java" value="java">Java</SelectItem>
                <SelectItem key="csharp" value="csharp">C#</SelectItem>
                <SelectItem key="php" value="php">PHP</SelectItem>
                <SelectItem key="typescript" value="typescript">TypeScript</SelectItem>
                <SelectItem key="swift" value="swift">Swift</SelectItem>
                <SelectItem key="kotlin" value="kotlin">Kotlin</SelectItem>
                <SelectItem key="go" value="go">Go</SelectItem>
                <SelectItem key="ruby" value="ruby">Ruby</SelectItem>
                <SelectItem key="rust" value="rust">Rust</SelectItem>
                <SelectItem key="html" value="html">HTML</SelectItem>
                <SelectItem key="css" value="css">CSS</SelectItem>
                <SelectItem key="sql" value="sql">SQL</SelectItem>
              </Select>
              
              <Select 
                label="Framework/Library" 
                placeholder="Pilih framework (opsional)"
                className="font-apple"
              >
                <SelectItem key="none" value="none">Tidak Ada</SelectItem>
                <SelectItem key="react" value="react">React</SelectItem>
                <SelectItem key="vue" value="vue">Vue.js</SelectItem>
                <SelectItem key="angular" value="angular">Angular</SelectItem>
                <SelectItem key="nodejs" value="nodejs">Node.js</SelectItem>
                <SelectItem key="express" value="express">Express.js</SelectItem>
                <SelectItem key="django" value="django">Django</SelectItem>
                <SelectItem key="flask" value="flask">Flask</SelectItem>
                <SelectItem key="spring" value="spring">Spring Boot</SelectItem>
                <SelectItem key="laravel" value="laravel">Laravel</SelectItem>
                <SelectItem key="dotnet" value="dotnet">.NET</SelectItem>
                <SelectItem key="rails" value="rails">Ruby on Rails</SelectItem>
                <SelectItem key="nextjs" value="nextjs">Next.js</SelectItem>
                <SelectItem key="nuxtjs" value="nuxtjs">Nuxt.js</SelectItem>
                <SelectItem key="svelte" value="svelte">Svelte</SelectItem>
              </Select>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-default-500 mb-2 font-poppins">Tujuan Kode</p>
              <RadioGroup orientation="horizontal">
                <Radio value="function">Fungsi</Radio>
                <Radio value="class">Kelas</Radio>
                <Radio value="script">Skrip Utuh</Radio>
                <Radio value="component">Komponen UI</Radio>
                <Radio value="algorithm">Algoritma</Radio>
                <Radio value="api">Endpoint API</Radio>
              </RadioGroup>
            </div>
          </AccordionItem>
          
          <AccordionItem 
            key="advanced-settings" 
            aria-label="Pengaturan Lanjutan" 
            title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:sliders" className="text-primary" />
                <span className="font-semibold">Pengaturan Lanjutan</span>
              </div>
            }
            subtitle="Pengaturan detail untuk hasil yang lebih spesifik"
            className="font-poppins"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select 
                label="Gaya Kode" 
                placeholder="Pilih gaya kode"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="oop" value="oop">Berorientasi Objek (OOP)</SelectItem>
                <SelectItem key="functional" value="functional">Fungsional</SelectItem>
                <SelectItem key="procedural" value="procedural">Prosedural</SelectItem>
                <SelectItem key="declarative" value="declarative">Deklaratif</SelectItem>
                <SelectItem key="imperative" value="imperative">Imperatif</SelectItem>
              </Select>
              
              <Select 
                label="Tingkat Komentar" 
                placeholder="Pilih tingkat komentar"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="none" value="none">Tanpa Komentar</SelectItem>
                <SelectItem key="minimal" value="minimal">Minimal</SelectItem>
                <SelectItem key="detailed" value="detailed">Detail</SelectItem>
                <SelectItem key="docstrings" value="docstrings">Dengan Docstrings</SelectItem>
              </Select>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-default-500 mb-2 font-poppins">Optimasi</p>
              <RadioGroup orientation="horizontal">
                <Radio value="none">Tanpa Optimasi</Radio>
                <Radio value="performance">Performa</Radio>
                <Radio value="readability">Keterbacaan</Radio>
                <Radio value="memory">Penggunaan Memori</Radio>
              </RadioGroup>
            </div>
          </AccordionItem>
        </Accordion>
      </>
    );
  };
  
  // Render prompt history section
  const renderPromptHistory = () => {
    if (promptHistory.length === 0) {
      return (
        <div className="mt-8 text-center text-default-500 font-poppins">
          <Icon icon="lucide:history" className="mx-auto text-4xl mb-2" />
          Belum ada riwayat prompt.
        </div>
      );
    }
    
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 font-poppins flex items-center gap-2">
          <Icon icon="lucide:history" />
          Riwayat Prompt
        </h3>
        {promptHistory.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3 mb-2 bg-content1 rounded-lg shadow-sm border border-default-200 hover:bg-content2/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon icon="lucide:file-text" className="text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium font-sora truncate max-w-xs md:max-w-md">
                  {item.title || "Prompt Tanpa Judul"}
                </p>
                <p className="text-xs text-default-500 font-apple">
                  Disimpan pada: {new Date(item.date).toLocaleDateString("id-ID", {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Tooltip content="Lihat Prompt">
                <Button 
                  isIconOnly 
                  size="sm" 
                  variant="light" 
                  className="transition-transform hover:scale-110"
                  onPress={() => loadPromptFromHistory(item)}
                >
                  <Icon icon="lucide:eye" className="text-default-500" />
                </Button>
              </Tooltip>
              <Tooltip content="Hapus Prompt">
                <Button 
                  isIconOnly 
                  size="sm" 
                  variant="light" 
                  className="transition-transform hover:scale-110"
                  onPress={() => deletePromptFromHistory(item.id)}
                >
                  <Icon icon="lucide:trash-2" className="text-danger" />
                </Button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Enhanced error handling function
  const handleError = (title: string, message: string) => {
    setError({
      title,
      message,
      visible: true
    });
    
    // Auto-hide error after 8 seconds
    setTimeout(() => {
      setError(prev => ({ ...prev, visible: false }));
    }, 8000);
  };
  
  // Render donation card with increased margin
  const renderDonationCard = () => {
    // Add function to handle button click
    const handleCoffeeButtonClick = () => {
      // Open the Saweria link in a new tab
      window.open("https://saweria.co/alienrektz", "_blank", "noopener,noreferrer");
    };

    return (
      <Card className="bg-content1 border-none mb-6 mt-12">
        <CardBody className="gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-sora font-semibold mb-2">Dukung Pengembangan JARVX</h3>
              <p className="text-default-400 font-sora">
                Bantu kami terus mengembangkan fitur-fitur baru dengan memberikan donasi
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                color="primary" 
                variant="flat" 
                startContent={<Icon icon="lucide:coffee" />}
                className="font-sora"
                onPress={handleCoffeeButtonClick}
              >
                Traktir Kopi
              </Button>
              <Button 
                variant="bordered" 
                startContent={<Icon icon="lucide:heart" />}
                className="font-sora"
              >
                Donasi Bulanan
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };
  
  return (
    <section className="py-8 px-4 bg-content2/20 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        {renderError()}
        
        {!showResult ? (
          <Card className="bg-content1 border-none shadow-lg lg:col-span-2">
            <CardBody className="gap-4 p-6">
              <div className="flex items-center gap-2 font-poppins mb-2">
                <Icon icon="lucide:sparkles" className="text-primary" />
                <span className="text-xl font-semibold">Jarvx AI</span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-default-500 mb-2 font-poppins">Pilih Jenis Generate</p>
                <RadioGroup 
                  orientation="horizontal" 
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <Radio value="image">Generate Gambar</Radio>
                  <Radio value="video">Generate Video</Radio>
                  <Radio value="code">Generate Kode</Radio>
                </RadioGroup>
              </div>
              
              <Textarea
                label="Deskripsikan Ide Anda"
                placeholder="Contoh: burung terbang di angasa"
                variant="bordered"
                className="mb-4 font-apple"
                minRows={2}
                value={promptText}
                onValueChange={setPromptText}
              />
              
              {selectedType === "image" && renderImageOptions()}
              {selectedType === "video" && renderVideoOptions()}
              {selectedType === "code" && renderCodeOptions()}
            </CardBody>
            <CardFooter className="justify-between border-t border-divider">
              <Button 
                variant="flat" 
                className="font-poppins transition-transform hover:scale-105"
                onPress={handleReset} // Added onPress handler
              >
                Reset
              </Button>
              <Button 
                color="primary" 
                className="font-poppins text-white transition-transform hover:scale-105"
                onPress={enhancePromptWithGemini}
                isLoading={isLoading}
                isDisabled={!promptText.trim()}
              >
                {isLoading ? "Menyempurnakan..." : "Hasilkan Prompt"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          renderResultCard()
        )}
        
        {renderPromptHistory()}
        
        {renderDonationCard()}
      </div>
    </section>
  );
};