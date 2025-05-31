import React from 'react';
import { Card, CardBody, CardFooter, Input, Button, Textarea, Tabs, Tab, Chip, Select, SelectItem, RadioGroup, Radio, Image, Spinner, Accordion, AccordionItem, Badge, Tooltip, Alert } from "@heroui/react";
import { addToast } from "@heroui/react";
import { Icon } from "@iconify/react";

export const PromptGenerator: React.FC = () => {
  const [selectedType, setSelectedType] = React.useState("image");
  const [selectedImageType, setSelectedImageType] = React.useState(new Set(["portrait"]));
  const [selectedStyle, setSelectedStyle] = React.useState(new Set(["realistic"]));
  const [selectedAspectRatio, setSelectedAspectRatio] = React.useState(new Set(["1:1"]));
  const [selectedLocation, setSelectedLocation] = React.useState(new Set(["none"]));
  const [selectedMood, setSelectedMood] = React.useState(new Set(["none"]));
  const [selectedTime, setSelectedTime] = React.useState(new Set(["none"]));
  const [selectedWeather, setSelectedWeather] = React.useState(new Set(["none"]));
  const [selectedAccessories, setSelectedAccessories] = React.useState(new Set(["none"]));
  const [selectedEmotion, setSelectedEmotion] = React.useState(new Set(["none"]));
  const [selectedResolution, setSelectedResolution] = React.useState(new Set(["4k"]));
  const [selectedCameraAngle, setSelectedCameraAngle] = React.useState(new Set(["eye"]));
  const [selectedBackground, setSelectedBackground] = React.useState(new Set(["with"]));
  
  const [promptText, setPromptText] = React.useState("");
  const [enhancedPrompt, setEnhancedPrompt] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);
  
  // Add new state for cleaned prompt
  const [cleanedPrompt, setCleanedPrompt] = React.useState("");
  
  // Add state for prompt history
  const [promptHistory, setPromptHistory] = React.useState<{id: string; title: string; prompt: string; date: Date}[]>([]);
  
  // Add new state for image upload
  const [uploadedImage, setUploadedImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Add new state for manual inputs
  const [manualInputs, setManualInputs] = React.useState<{[key: string]: string}>({
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
  });
  
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
  } | null>(null);
  
  // Add error state
  const [error, setError] = React.useState<{
    title: string;
    message: string;
    visible: boolean;
  }>({
    title: "",
    message: "",
    visible: false
  });
  
  // Load prompt history from localStorage on component mount
  React.useEffect(() => {
    const savedHistory = localStorage.getItem('jarvxPromptHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setPromptHistory(parsedHistory);
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
      prompt: cleanedPrompt,
      date: new Date()
    };
    
    const updatedHistory = [newHistoryItem, ...promptHistory];
    setPromptHistory(updatedHistory);
    
    // Save to localStorage
    localStorage.setItem('jarvxPromptHistory', JSON.stringify(updatedHistory));
    
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
    localStorage.setItem('jarvxPromptHistory', JSON.stringify(updatedHistory));
    
    // Show success toast
    addToast({
      title: "Prompt berhasil dihapus",
      color: "success",
    });
  };
  
  // Function to load prompt from history
  const loadPromptFromHistory = (historyItem: {id: string; title: string; prompt: string}) => {
    setCleanedPrompt(historyItem.prompt);
    setShowResult(true);
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
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
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
        const cleanedPrompt = generatedText
          .replace(/```/g, '')
          .replace(/^prompt:/i, '')
          .replace(/^generated prompt:/i, '')
          .trim();
        
        setEnhancedPrompt(generatedText);
        setCleanedPrompt(cleanedPrompt);
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
    // Wait a moment before retrying to ensure UI updates
    setTimeout(() => {
      enhancePromptWithGemini();
    }, 500);
  };
  
  // Enhanced error display with retry button
  const renderError = () => {
    if (!error.visible) return null;
    
    return (
      <Alert
        className="mb-4"
        color="danger"
        title={error.title}
        description={
          <div className="flex flex-col gap-2">
            <p>{error.message}</p>
            <Button 
              size="sm" 
              color="primary" 
              variant="flat" 
              onPress={handleRetry}
              className="self-end mt-1"
            >
              Coba Lagi
            </Button>
          </div>
        }
        isVisible={error.visible}
        onVisibleChange={(visible) => setError(prev => ({ ...prev, visible }))}
        isClosable
      />
    );
  };
  
  // Enhanced renderImageAnalysis to show more detailed results
  const renderImageAnalysis = () => {
    if (!imageAnalysis) return null;
    
    return (
      <div className="mt-4 p-3 bg-content2/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Icon icon="lucide:search" className="text-primary" />
          <p className="text-sm font-medium">Hasil Analisis Gambar</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-default-400">Subjek Utama:</p>
            <p className="font-medium">{imageAnalysis.subject}</p>
          </div>
          
          <div>
            <p className="text-default-400">Gaya Visual:</p>
            <p className="font-medium">{imageAnalysis.style}</p>
          </div>
          
          <div>
            <p className="text-default-400">Komposisi:</p>
            <p className="font-medium">{imageAnalysis.composition}</p>
          </div>
          
          <div>
            <p className="text-default-400">Suasana:</p>
            <p className="font-medium">{imageAnalysis.mood}</p>
          </div>
          
          <div>
            <p className="text-default-400">Pencahayaan:</p>
            <p className="font-medium">{imageAnalysis.lighting}</p>
          </div>
          
          <div>
            <p className="text-default-400">Perspektif:</p>
            <p className="font-medium">{imageAnalysis.perspective}</p>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-default-400 text-xs">Warna Dominan:</p>
          <div className="flex gap-1 mt-1">
            {imageAnalysis.colors.map((color, index) => (
              <div 
                key={index} 
                className="w-6 h-6 rounded-full border border-white/20" 
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
        
        {imageAnalysis.details && imageAnalysis.details.length > 0 && (
          <div className="mt-2">
            <p className="text-default-400 text-xs">Detail Penting:</p>
            <ul className="list-disc list-inside text-xs pl-1 mt-1">
              {imageAnalysis.details.slice(0, 3).map((detail, index) => (
                <li key={index} className="font-medium">{detail}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  // Update the image upload UI to include analysis results
  const renderImageUploadSection = () => {
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
              <Select 
                label="Jenis Gambar" 
                placeholder="Pilih jenis gambar"
                selectedKeys={selectedImageType}
                onSelectionChange={setSelectedImageType as any}
                className="w-full"
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
              
              <Select 
                label="Gaya Artistik" 
                placeholder="Pilih gaya visual"
                selectedKeys={selectedStyle}
                onSelectionChange={setSelectedStyle as any}
                className="w-full"
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select 
                label="Rasio Aspek" 
                placeholder="Pilih rasio aspek"
                selectedKeys={selectedAspectRatio}
                onSelectionChange={setSelectedAspectRatio as any}
                className="w-full"
                variant="bordered"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="1:1" value="1:1">1:1 (Instagram Post/Profil Picture)</SelectItem>
                <SelectItem key="4:5" value="4:5">4:5 (Instagram Portrait)</SelectItem>
                <SelectItem key="16:9" value="16:9">16:9 (Landscape/YouTube)</SelectItem>
                <SelectItem key="9:16" value="9:16">9:16 (Story/Reels/TikTok)</SelectItem>
                <SelectItem key="3:2" value="3:2">3:2 (Fotografi Standar)</SelectItem>
                <SelectItem key="2:3" value="2:3">2:3 (Portrait Standar)</SelectItem>
                <SelectItem key="21:9" value="21:9">21:9 (Ultrawide/Cinematic)</SelectItem>
                <SelectItem key="4:3" value="4:3">4:3 (Klasik)</SelectItem>
                <SelectItem key="3:4" value="3:4">3:4 (Portrait Klasik)</SelectItem>
                <SelectItem key="5:4" value="5:4">5:4 (Large Format)</SelectItem>
                <SelectItem key="1.91:1" value="1.91:1">1.91:1 (Facebook)</SelectItem>
              </Select>
              
              <Select 
                label="Resolusi" 
                placeholder="Pilih resolusi"
                selectedKeys={selectedResolution}
                onSelectionChange={setSelectedResolution as any}
                className="w-full"
                variant="bordered"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="8k" value="8k">8K (7680 x 4320)</SelectItem>
                <SelectItem key="4k" value="4k">4K (3840 x 2160)</SelectItem>
                <SelectItem key="2k" value="2k">2K (2560 x 1440)</SelectItem>
                <SelectItem key="fhd" value="fhd">Full HD (1920 x 1080)</SelectItem>
                <SelectItem key="hd" value="hd">HD (1280 x 720)</SelectItem>
                <SelectItem key="square_hd" value="square_hd">Square HD (1080 x 1080)</SelectItem>
                <SelectItem key="portrait_hd" value="portrait_hd">Portrait HD (1080 x 1350)</SelectItem>
              </Select>
            </div>
            
            {renderImageUploadSection()}
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
              <div>
                <Select 
                  label="Tempat" 
                  placeholder="Pilih lokasi"
                  selectedKeys={selectedLocation}
                  onSelectionChange={setSelectedLocation as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="none" value="none">Tidak Ditentukan</SelectItem>
                  <SelectItem key="forest" value="forest">Hutan</SelectItem>
                  <SelectItem key="beach" value="beach">Pantai</SelectItem>
                  <SelectItem key="mountains" value="mountains">Pegunungan</SelectItem>
                  <SelectItem key="desert" value="desert">Gurun</SelectItem>
                  <SelectItem key="grassland" value="grassland">Padang Rumput</SelectItem>
                  <SelectItem key="rainforest" value="rainforest">Hutan Hujan Tropis</SelectItem>
                  <SelectItem key="deep_sea" value="deep_sea">Laut Dalam</SelectItem>
                  <SelectItem key="waterfall" value="waterfall">Air Terjun</SelectItem>
                  <SelectItem key="river" value="river">Sungai</SelectItem>
                  <SelectItem key="lake" value="lake">Danau</SelectItem>
                  <SelectItem key="cliff" value="cliff">Tebing</SelectItem>
                  <SelectItem key="cave" value="cave">Goa</SelectItem>
                  <SelectItem key="city_street" value="city_street">Jalan Kota</SelectItem>
                  <SelectItem key="narrow_alley" value="narrow_alley">Gang Sempit</SelectItem>
                  <SelectItem key="city_park" value="city_park">Taman Kota</SelectItem>
                  <SelectItem key="rooftop" value="rooftop">Rooftop Gedung</SelectItem>
                  <SelectItem key="castle" value="castle">Kastil</SelectItem>
                  <SelectItem key="palace" value="palace">Istana</SelectItem>
                  <SelectItem key="japanese_temple" value="japanese_temple">Kuil Jepang</SelectItem>
                  <SelectItem key="futuristic_city" value="futuristic_city">Kota Futuristik</SelectItem>
                  <SelectItem key="cyberpunk_city" value="cyberpunk_city">Kota Cyberpunk</SelectItem>
                  <SelectItem key="steampunk_city" value="steampunk_city">Kota Steampunk</SelectItem>
                  <SelectItem key="old_europe" value="old_europe">Kota Tua Eropa</SelectItem>
                  <SelectItem key="medieval_city" value="medieval_city">Kota Abad Pertengahan</SelectItem>
                  <SelectItem key="traditional_village" value="traditional_village">Perkampungan Tradisional</SelectItem>
                  <SelectItem key="space" value="space">Ruang Angkasa</SelectItem>
                  <SelectItem key="alien_planet" value="alien_planet">Planet Asing</SelectItem>
                  <SelectItem key="fantasy_world" value="fantasy_world">Dunia Fantasi</SelectItem>
                  <SelectItem key="underwater_world" value="underwater_world">Dunia Bawah Laut</SelectItem>
                  <SelectItem key="dream_world" value="dream_world">Dunia Mimpi</SelectItem>
                  <SelectItem key="post_apocalyptic" value="post_apocalyptic">Dunia Pasca-Apokaliptik</SelectItem>
                  <SelectItem key="hell" value="hell">Neraka</SelectItem>
                  <SelectItem key="heaven" value="heaven">Surga</SelectItem>
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
                  label="Suasana" 
                  placeholder="Pilih suasana"
                  selectedKeys={selectedMood}
                  onSelectionChange={setSelectedMood as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="none" value="none">Tidak Ditentukan</SelectItem>
                  <SelectItem key="mystic" value="mystic">Mistis</SelectItem>
                  <SelectItem key="peaceful" value="peaceful">Damai</SelectItem>
                  <SelectItem key="romantic" value="romantic">Romantis</SelectItem>
                  <SelectItem key="dark" value="dark">Gelap</SelectItem>
                  <SelectItem key="gloomy" value="gloomy">Suram</SelectItem>
                  <SelectItem key="scary" value="scary">Menyeramkan</SelectItem>
                  <SelectItem key="cheerful" value="cheerful">Riang</SelectItem>
                  <SelectItem key="solemn" value="solemn">Khusyuk</SelectItem>
                  <SelectItem key="majestic" value="majestic">Megah</SelectItem>
                  <SelectItem key="epic" value="epic">Epik</SelectItem>
                  <SelectItem key="magical" value="magical">Magis</SelectItem>
                  <SelectItem key="melancholic" value="melancholic">Melankolis</SelectItem>
                  <SelectItem key="warm" value="warm">Hangat</SelectItem>
                  <SelectItem key="cold" value="cold">Dingin</SelectItem>
                  <SelectItem key="chaotic" value="chaotic">Kacau</SelectItem>
                  <SelectItem key="crowded" value="crowded">Ramai</SelectItem>
                  <SelectItem key="quiet" value="quiet">Sepi</SelectItem>
                  <SelectItem key="dramatic" value="dramatic">Dramatis</SelectItem>
                  <SelectItem key="tense" value="tense">Menegangkan</SelectItem>
                  <SelectItem key="apocalyptic" value="apocalyptic">Apokaliptik</SelectItem>
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
                  <SelectItem key="dawn" value="dawn">Subuh</SelectItem>
                  <SelectItem key="morning" value="morning">Pagi Hari</SelectItem>
                  <SelectItem key="noon" value="noon">Siang Hari</SelectItem>
                  <SelectItem key="afternoon" value="afternoon">Sore Hari</SelectItem>
                  <SelectItem key="dusk" value="dusk">Senja</SelectItem>
                  <SelectItem key="evening" value="evening">Malam Hari</SelectItem>
                  <SelectItem key="midnight" value="midnight">Tengah Malam</SelectItem>
                  <SelectItem key="golden_hour" value="golden_hour">Waktu Emas (Golden Hour)</SelectItem>
                  <SelectItem key="blue_hour" value="blue_hour">Waktu Biru (Blue Hour)</SelectItem>
                  <SelectItem key="3am" value="3am">Jam 3 Pagi</SelectItem>
                  <SelectItem key="fictional_time" value="fictional_time">Waktu Fiksi (Di Luar Ruang-Waktu)</SelectItem>
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
                  placeholder="Pilih kondisi cuaca"
                  selectedKeys={selectedWeather}
                  onSelectionChange={setSelectedWeather as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="none" value="none">Tidak Ditentukan</SelectItem>
                  <SelectItem key="sunny" value="sunny">Cerah</SelectItem>
                  <SelectItem key="overcast" value="overcast">Mendung</SelectItem>
                  <SelectItem key="cloudy" value="cloudy">Berawan</SelectItem>
                  <SelectItem key="light_rain" value="light_rain">Hujan Ringan</SelectItem>
                  <SelectItem key="heavy_rain" value="heavy_rain">Hujan Lebat</SelectItem>
                  <SelectItem key="storm" value="storm">Hujan Badai</SelectItem>
                  <SelectItem key="thick_fog" value="thick_fog">Kabut Tebal</SelectItem>
                  <SelectItem key="snow_storm" value="snow_storm">Badai Salju</SelectItem>
                  <SelectItem key="snowing" value="snowing">Salju Turun</SelectItem>
                  <SelectItem key="strong_wind" value="strong_wind">Angin Kencang</SelectItem>
                  <SelectItem key="lightning" value="lightning">Petir Menyambar</SelectItem>
                  <SelectItem key="rainbow" value="rainbow">Pelangi Muncul</SelectItem>
                  <SelectItem key="morning_dew" value="morning_dew">Embun Pagi</SelectItem>
                  <SelectItem key="tropical" value="tropical">Cuaca Tropis</SelectItem>
                  <SelectItem key="desert_weather" value="desert_weather">Cuaca Gurun</SelectItem>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Select 
                  label="Aksesori / Detail Visual" 
                  placeholder="Pilih aksesori"
                  selectedKeys={selectedAccessories}
                  onSelectionChange={setSelectedAccessories as any}
                  className="w-full mb-2"
                  variant="bordered"
                >
                  <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                  <SelectItem key="none" value="none">Tidak Ada</SelectItem>
                  <SelectItem key="sword" value="sword">Pedang</SelectItem>
                  <SelectItem key="cloak" value="cloak">Jubah</SelectItem>
                  <SelectItem key="glasses" value="glasses">Kacamata</SelectItem>
                  <SelectItem key="umbrella" value="umbrella">Payung</SelectItem>
                  <SelectItem key="wide_hat" value="wide_hat">Topi Lebar</SelectItem>
                  <SelectItem key="gloves" value="gloves">Sarung Tangan</SelectItem>
                  <SelectItem key="necklace" value="necklace">Kalung</SelectItem>
                  <SelectItem key="earrings" value="earrings">Anting</SelectItem>
                  <SelectItem key="crown" value="crown">Mahkota</SelectItem>
                  <SelectItem key="tattoo" value="tattoo">Tato</SelectItem>
                  <SelectItem key="wings" value="wings">Sayap</SelectItem>
                  <SelectItem key="eye_light" value="eye_light">Ekspresi Cahaya Mata</SelectItem>
                  <SelectItem key="pet_robot" value="pet_robot">Robot Peliharaan</SelectItem>
                  <SelectItem key="hoverboard" value="hoverboard">Hoverboard</SelectItem>
                  <SelectItem key="city_background" value="city_background">Latar Belakang Kota</SelectItem>
                  <SelectItem key="neon_lights" value="neon_lights">Lampu Neon</SelectItem>
                  <SelectItem key="smoke" value="smoke">Asap</SelectItem>
                  <SelectItem key="lantern" value="lantern">Lentera</SelectItem>
                  <SelectItem key="magic_book" value="magic_book">Buku Sihir</SelectItem>
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
                <SelectItem key="happy" value="happy">Ceria</SelectItem>
                <SelectItem key="dramatic" value="dramatic">Dramatis</SelectItem>
                <SelectItem key="mysterious" value="mysterious">Misterius</SelectItem>
                <SelectItem key="epic" value="epic">Epik</SelectItem>
                <SelectItem key="romantic" value="romantic">Romantis</SelectItem>
                <SelectItem key="scary" value="scary">Menyeramkan</SelectItem>
                <SelectItem key="funny" value="funny">Lucu</SelectItem>
              </Select>
              
              <Select 
                label="Efek Visual" 
                placeholder="Pilih efek visual"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="none" value="none">Tidak Ada</SelectItem>
                <SelectItem key="particles" value="particles">Partikel</SelectItem>
                <SelectItem key="glow" value="glow">Glow</SelectItem>
                <SelectItem key="blur" value="blur">Blur</SelectItem>
                <SelectItem key="grain" value="grain">Grain</SelectItem>
                <SelectItem key="glitch" value="glitch">Glitch</SelectItem>
                <SelectItem key="vhs" value="vhs">VHS</SelectItem>
                <SelectItem key="cinematic" value="cinematic">Cinematic</SelectItem>
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
                placeholder="Pilih bahasa pemrograman"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="javascript" value="javascript">JavaScript</SelectItem>
                <SelectItem key="python" value="python">Python</SelectItem>
                <SelectItem key="java" value="java">Java</SelectItem>
                <SelectItem key="csharp" value="csharp">C#</SelectItem>
                <SelectItem key="cpp" value="cpp">C++</SelectItem>
                <SelectItem key="php" value="php">PHP</SelectItem>
              </Select>
              
              <Select 
                label="Framework/Library" 
                placeholder="Pilih framework/library"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="none" value="none">Tidak Ada</SelectItem>
                <SelectItem key="react" value="react">React</SelectItem>
                <SelectItem key="vue" value="vue">Vue.js</SelectItem>
                <SelectItem key="angular" value="angular">Angular</SelectItem>
                <SelectItem key="django" value="django">Django</SelectItem>
                <SelectItem key="flask" value="flask">Flask</SelectItem>
                <SelectItem key="laravel" value="laravel">Laravel</SelectItem>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select 
                label="Jenis Kode" 
                placeholder="Pilih jenis kode"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="function" value="function">Fungsi/Method</SelectItem>
                <SelectItem key="class" value="class">Class/Object</SelectItem>
                <SelectItem key="algorithm" value="algorithm">Algoritma</SelectItem>
                <SelectItem key="api" value="api">API Endpoint</SelectItem>
                <SelectItem key="component" value="component">UI Component</SelectItem>
                <SelectItem key="database" value="database">Database Query</SelectItem>
              </Select>
              
              <Select 
                label="Tingkat Kompleksitas" 
                placeholder="Pilih tingkat kompleksitas"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="beginner" value="beginner">Pemula</SelectItem>
                <SelectItem key="intermediate" value="intermediate">Menengah</SelectItem>
                <SelectItem key="advanced" value="advanced">Lanjutan</SelectItem>
                <SelectItem key="expert" value="expert">Expert</SelectItem>
              </Select>
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
            <div className="mb-4">
              <p className="text-sm text-default-500 mb-2 font-poppins">Opsi Tambahan</p>
              <div className="flex flex-wrap gap-2">
                <Chip variant="flat" className="font-apple">Dengan Komentar</Chip>
                <Chip variant="flat" className="font-apple">Dengan Unit Test</Chip>
                <Chip variant="flat" className="font-apple">Optimasi Performa</Chip>
                <Chip variant="flat" className="font-apple">Best Practices</Chip>
                <Chip variant="flat" className="font-apple">Kode Minimal</Chip>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select 
                label="Format Output" 
                placeholder="Pilih format output"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="function" value="function">Fungsi Tunggal</SelectItem>
                <SelectItem key="module" value="module">Modul Lengkap</SelectItem>
                <SelectItem key="snippet" value="snippet">Code Snippet</SelectItem>
                <SelectItem key="project" value="project">Struktur Project</SelectItem>
              </Select>
              
              <Select 
                label="Style Guide" 
                placeholder="Pilih style guide"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="standard" value="standard">Standard</SelectItem>
                <SelectItem key="google" value="google">Google</SelectItem>
                <SelectItem key="airbnb" value="airbnb">Airbnb</SelectItem>
                <SelectItem key="microsoft" value="microsoft">Microsoft</SelectItem>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select 
                label="Paradigma" 
                placeholder="Pilih paradigma pemrograman"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="oop" value="oop">Object-Oriented</SelectItem>
                <SelectItem key="functional" value="functional">Functional</SelectItem>
                <SelectItem key="procedural" value="procedural">Procedural</SelectItem>
                <SelectItem key="reactive" value="reactive">Reactive</SelectItem>
              </Select>
              
              <Select 
                label="Target Platform" 
                placeholder="Pilih platform target"
                className="font-apple"
              >
                <SelectItem key="auto" value="auto">Otomatis</SelectItem>
                <SelectItem key="web" value="web">Web</SelectItem>
                <SelectItem key="mobile" value="mobile">Mobile</SelectItem>
                <SelectItem key="desktop" value="desktop">Desktop</SelectItem>
                <SelectItem key="server" value="server">Server</SelectItem>
                <SelectItem key="embedded" value="embedded">Embedded</SelectItem>
              </Select>
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
        <div className="text-center py-8 text-default-400">
          <Icon icon="lucide:history" className="mx-auto mb-2 text-3xl" />
          <p>Belum ada riwayat prompt</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {promptHistory.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3 bg-content2/50 rounded-lg hover:bg-content2/80 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Icon icon="lucide:file-text" className="text-primary flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-xs text-default-400">
                  {new Date(item.date).toLocaleDateString('id-ID', {
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