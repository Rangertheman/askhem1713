export function registerDefaultFonts() {
    CONFIG.fontDefinitions["Acme"] = {
      editor: true,
      fonts:[
        {urls: ["systems/askhem1713/fonts/Acme-Regular.ttf"]},
      ]
    };
    CONFIG.fontDefinitions["Baskerville"] = {
        editor: true,
        fonts:[
            {urls: ["systems/askhem1713/fonts/LibreBaskerville-Regular.ttf"]},
            {urls: ["systems/askhem1713/fonts/LibreBaskerville-Italic.ttf"], style: "italic"},
            {urls: ["systems/askhem1713/fonts/LibreBaskerville-Bold.ttf"], weight: "700"},
        ]
    };
    CONFIG.fontDefinitions["Beth Ellen"] = {
      editor: true,
      fonts:[
        {urls: ["systems/askhem1713/fonts/BethEllen-Regular.ttf"]},
      ]
    };
    CONFIG.fontDefinitions["Berolina"] = {
      editor: true,
      fonts:[
        {urls: ["systems/askhem1713/fonts/Berolina.ttf"]},
      ]
    };
    CONFIG.fontDefinitions["Libertine"] = {
      editor: true,
      fonts:[
        {urls: ["systems/askhem1713/fonts/LinLibertine_R.ttf"]},
      ]
    };
    CONFIG.fontDefinitions["Poppins"] = {
      editor: true,
      fonts:[
        {urls: ["systems/askhem1713/fonts/Poppins-Regular.ttf"]},
        {urls: ["systems/askhem1713/fonts/Poppins-Italic.ttf"], style: "italic"},
        {urls: ["systems/askhem1713/fonts/Poppins-Bold.ttf"], weight: "700"},
        {urls: ["systems/askhem1713/fonts/Poppins-BoldItalic.ttf"], weight: "700", style: "italic"},
      ]
    };
    CONFIG.fontDefinitions["Pica"] = {
        editor: true,
        fonts:[
            {urls: ["systems/askhem1713/fonts/IMFellDoublePica-Regular.ttf"], style: "normal"},
            {urls: ["systems/askhem1713/fonts/IMFellDoublePica-Italic.ttf"], style: "italic"},
        ]
    };
    
  }
  