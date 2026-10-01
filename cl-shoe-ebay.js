// ═══════════════════════════════════════════════════════════════════════════
// DECISION #6: SHOE CSV STRATEGY — Shared Module
// ═══════════════════════════════════════════════════════════════════════════
// Single source of truth for shoe routing, taxonomy, and validation.
// Used by both app.js and test-decision-6.js.

// ── Shoe Taxonomy: Category-specific constraints (from actual eBay metadata) ─
const CL_SHOE_TAXONOMY = {
  "147285": {
    "id": "147285",
    "name": "Baby Shoes",
    "path": "Clothing, Shoes & Accessories > Baby > Baby Shoes",
    "requiredAspects": ["Brand","Style","Color","Department","Type","Upper Material","US Shoe Size"],
    "brand": {"present":true,"required":true},
    "conditions": {"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},
    "aspects": {
      "US Shoe Size": {"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Newborn","0.5","1","1.5","2","2.5","3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10"]},
      "Upper Material": {"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cashmere","100% Cotton","100% Silk","100% Wool","Acetate","Acrylic","Alpaca","Angora","Bamboo","Bullhide Leather","Camel","Cashmere","Cotton","Cotton Blend","Cupro","Fabric","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Flax","Fur","Hemp","Leather","Linen","Linen Blend","Lyocell","Mesh","Microfiber","Modal","Mohair","Nubuck","Nylon","Patent Leather","PLA Fiber","Plastic","Polyamide","Polycotton","Polyester","Polyethylene","Polyimide","Polyurethane","PVC","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Vinyl","Viscose","Wool","Wool Blend"]},
      "Shoe Width": {"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","H","M","N","W"]},
      "Style": {"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Ballet","Biker","Boat Shoe","Bootie","Chelsea","Chukka","Clog","Desert","Espadrille","Fisherman","Flat","Flip Flop","Gladiator","Loafer","Mary Jane","Moccasin","Mule","Oxford","Platform","Rain Boot","Shearling Style","Slide","Slip-On","Sneaker","Snow Boot","Sock"]},
      "Type": {"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Athletic","Boot","Casual","Dress","Flat","Sandal","Slipper"]},
      "Performance/Activity": {"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"MULTI","enabledForVariations":true,"values":["Baseball","Basketball","Beach","Bodybuilding","Bowling","Boxing","Cheerleading","CrossFit","Cross Training","Cycling","Dance","Driving","Fishing","Football","Golf","Gym & Training","Hiking","Hockey","Hunting","Lacrosse","Military","Motorcycle","Netball","Pilates","Racing","Riding","Rugby","Running & Jogging","School","Skateboarding","Skiing","Soccer","Squash","Tennis","Track & Field","Typing","Volleyball","Walking","Water Sports","Weightlifting","Wrestling","Yoga"]},
      "Color": {"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},
      "Department": {"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Unisex Baby & Toddler","Boys","Girls"]}
    }
  },
  "57929": {
    "id":"57929","name":"Boys' Shoes","path":"Clothing, Shoes & Accessories > Kids > Boys > Boys' Shoes",
    "requiredAspects":["Brand","US Shoe Size","Color","Department","Style","Type"],
    "brand":{"present":true,"required":true},
    "conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},
    "aspects":{
      "US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["1","1.5","2","2.5","3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5"]},
      "Upper Material":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cotton","100% Silk","100% Wool","Bullhide Leather","Cashmere","Cotton","Cotton Blend","Faux Leather","Faux Silk","Faux Suede","Fur","Hemp","Leather","Linen","Linen Blend","Lyocell","Mohair","Nubuck","Nylon","Patent Leather","Plastic","Polycotton","Polyester","Polyethylene","Polyurethane","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Viscose","Wool","Wool Blend"]},
      "Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},
      "Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Biker","Boat Shoe","Bootie","Brogue","Chelsea","Chukka","Clog","Combat","Derby","Desert","Espadrille","Fisherman","Flip Flop","Gladiator","Loafer","Moccasin","Monk Strap","Mule","Oxford","Rain Boot","Shearling Style","Slide","Slingback","Slip-On","Sneaker","Snow Boot","Sock","Western"]},
      "Type":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Athletic","Boot","Dress","Sandal","Slipper"]},
      "Performance/Activity":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"MULTI","enabledForVariations":true,"values":["Baseball","Basketball","Beach","Bodybuilding","Bowling","Boxing","Cheerleading","CrossFit","Cross Training","Cycling","Dance","Driving","Fishing","Gym & Training","Hiking","Hockey","Hunting","Military","Motorcycle","Netball","Pilates","Racing","Riding","Rugby","Running & Jogging","School","Skateboarding","Skiing","Soccer","Squash","Tennis","Typing","Volleyball","Walking","Water Sports","Weightlifting","Yoga"]},
      "Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},
      "Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Boys","Unisex Kids"]}
    }
  },
  "57974": {
    "id":"57974","name":"Girls' Shoes","path":"Clothing, Shoes & Accessories > Kids > Girls > Girls' Shoes",
    "requiredAspects":["Brand","US Shoe Size","Department","Style","Color","Type"],
    "brand":{"present":true,"required":true},
    "conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},
    "aspects":{
      "US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["1","1.5","2","2.5","3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5"]},
      "Upper Material":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cotton","100% Silk","100% Wool","Bullhide Leather","Cashmere","Cotton","Cotton Blend","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Fur","Hemp","Leather","Linen","Linen Blend","Lyocell","Mohair","Nubuck","Nylon","Patent Leather","Plastic","Polycotton","Polyester","Polyethylene","Polyurethane","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Viscose","Wool","Wool Blend"]},
      "Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},
      "Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Ballet","Biker","Boat Shoe","Bootie","Brogue","Chelsea","Chukka","Clog","Combat","D'Orsay","Derby","Desert","Espadrille","Fisherman","Flat","Flip Flop","Gladiator","Loafer","Mary Jane","Moccasin","Monk Strap","Mule","Oxford","Platform","Pump","Rain Boot","Shearling Style","Slide","Slingback","Slip-On","Sneaker","Snow Boot","Sock","Strappy","Western"]},
      "Type":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Athletic","Boot","Dress","Flat","Heel","Sandal","Slipper"]},
      "Performance/Activity":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"MULTI","enabledForVariations":true,"values":["Baseball","Basketball","Beach","Bodybuilding","Bowling","Boxing","Cheerleading","CrossFit","Cross Training","Cycling","Dance","Driving","Fishing","Football","Golf","Gym & Training","Hiking","Hockey","Hunting","Lacrosse","Military","Motorcycle","Netball","Pilates","Racing","Riding","Rugby","Running & Jogging","School","Skateboarding","Skiing","Soccer","Squash","Tennis","Track & Field","Typing","Volleyball","Walking","Water Sports","Weightlifting","Wrestling","Yoga"]},
      "Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},
      "Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Girls","Unisex Kids"]}
    }
  },
  "155202": {
    "id":"155202","name":"Unisex Kids' Shoes","path":"Clothing, Shoes & Accessories > Kids > Unisex Kids > Unisex Kids' Shoes",
    "requiredAspects":["Brand","Color","Style","Type","US Shoe Size"],
    "brand":{"present":true,"required":true},
    "conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},
    "aspects":{
      "US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["1","1.5","2","2.5","3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5"]},
      "Upper Material":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cashmere","100% Cotton","100% Silk","100% Wool","Acetate","Acrylic","Alpaca","Angora","Bamboo","Bullhide Leather","Camel","Cashmere","Cotton","Cotton Blend","Cupro","Fabric","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Flax","Fur","Hemp","Leather","Linen","Linen Blend","Lyocell","Mesh","Microfiber","Modal","Mohair","Nubuck","Nylon","Patent Leather","PLA Fiber","Plastic","Polyamide","Polycotton","Polyester","Polyethylene","Polyimide","Polyurethane","PVC","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Vinyl","Viscose","Wool","Wool Blend"]},
      "Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","M","N","W"]},
      "Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Ballet","Biker","Boat Shoe","Bootie","Brogue","Chelsea","Chukka","Clog","Combat","D'Orsay","Derby","Desert","Espadrille","Fisherman","Flat","Flip Flop","Gladiator","Loafer","Mary Jane","Moccasin","Monk Strap","Mule","Oxford","Platform","Rain Boot","Shearling Style","Slide","Slingback","Slip-On","Sneaker","Snow Boot","Sock","Strappy","Thong","Western"]},
      "Type":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Athletic","Boot","Casual","Dress","Flat","Heel","Sandal","Slipper"]},
      "Performance/Activity":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"MULTI","enabledForVariations":true,"values":["Baseball","Basketball","Beach","Bodybuilding","Bowling","Boxing","Cheerleading","CrossFit","Cross Training","Cycling","Dance","Driving","Fishing","Football","Golf","Gym & Training","Hiking","Hockey","Hunting","Lacrosse","Military","Motorcycle","Netball","Pilates","Racing","Riding","Rugby","Running & Jogging","School","Skateboarding","Skiing","Soccer","Squash","Tennis","Track & Field","Typing","Volleyball","Walking","Water Sports","Weightlifting","Wrestling","Yoga"]},
      "Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},
      "Department":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Unisex Kids"]}
    }
  },
  "15709": {"id":"15709","name":"Athletic Shoes","path":"Clothing, Shoes & Accessories > Men > Men's Shoes > Athletic Shoes","requiredAspects":["Brand","US Shoe Size","Color","Department"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["2","2.5","3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20"]},"Upper Material":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cashmere","100% Cotton","100% Silk","100% Wool","Acetate","Acrylic","Alpaca","Angora","Bamboo","Bullhide Leather","Camel","Canvas","Cashmere","Celermesh","Clone","Cordura","Corduroy","Cork","Cotton","Cotton Blend","Crocodile","Croslite","Cupro","Denim","Durabuck","Engineered Knit","Engineered Mesh","Fabric","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Felt","FitWeave Lite","Flannel","Flax","Flexweave","Flightwire","Flymesh","Flyweave","Flywire","Foam","Foamposite","Fur","Fuzionfit360","Glitter","Goretex","Gripknit","Hemp","Hyperfuse","Intelliknit","Jacquard","Jute","Kangaroo Leather","Knit","Knitposite","Knit Textile","Leather","Leno-Weave","Lightlock","Linen","Linen Blend","Lyocell","Mesh","Modal","Mohair","Monomesh","Neoprene","Nubuck","Nylon","Patent Leather","Pigskin Suede","PLA Fiber","Plastic","Polyamide","Polycotton","Polyester","Polyethylene","Polyimide","Polyurethane","Pony Hair","Primegreen","Primeknit+","PVC","Recycled Polyester","Ripstop","Rubber","Satin","Sherpa","Silk","Silk Blend","Snakeskin","Space Waste Yarn","Spandex","Speedskin","Sprintskin","Strung","Suede","Synthetic","Textile","Tweed","Twill","Vaporposite","Vaporposite+","Vaporweave","Vegan","Vinyl","Viscose","Warp","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Sneaker"]},"Type":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Athletic"]},"Performance/Activity":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"MULTI","enabledForVariations":true,"values":["Baseball","Basketball","Beach","Bodybuilding","Bowling","Boxing","Cheerleading","CrossFit","Cross Training","Cycling","Dance","Driving","Fishing","Football","Golf","Gym & Training","Hiking","Hockey","Hunting","Lacrosse","Military","Motorcycle","Netball","Pilates","Racing","Riding","Rugby","Running & Jogging","School","Skateboarding","Skiing","Soccer","Squash","Tennis","Track & Field","Typing","Volleyball","Walking","Water Sports","Weightlifting","Wrestling","Yoga"]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Copper","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Men","Teens","Unisex Adults"]}}},
  "11498": {"id":"11498","name":"Boots","path":"Clothing, Shoes & Accessories > Men > Men's Shoes > Boots","requiredAspects":["Brand","US Shoe Size","Style","Department","Color","Upper Material"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["2","2.5","3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20"]},"Upper Material":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cotton","100% Silk","100% Wool","Alpaca","Angora","Bullhide Leather","Cotton","Cotton Blend","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Fur","Hemp","Leather","Lyocell","Mesh","Mohair","Nubuck","Nylon","Patent Leather","Plastic","Polyamide","Polycotton","Polyester","Polyimide","Polyurethane","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Vinyl","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Biker","Bootie","Chelsea","Chukka","Combat","Desert","Rain Boot","Shearling Style","Slip-On","Snow Boot","Western"]},"Type":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Boot"]},"Performance/Activity":{"present":false,"required":false,"mode":null,"cardinality":null,"enabledForVariations":null,"values":[]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Men","Teens","Unisex Adults"]}}},
  "24087": {"id":"24087","name":"Casual Shoes","path":"Clothing, Shoes & Accessories > Men > Men's Shoes > Casual Shoes","requiredAspects":["Brand","US Shoe Size","Department","Style","Color","Upper Material"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["2","2.5","3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20"]},"Upper Material":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cotton","100% Silk","100% Wool","Bullhide Leather","Cotton","Cotton Blend","Faux Leather","Faux Silk","Faux Suede","Hemp","Leather","Linen","Linen Blend","Lyocell","Nubuck","Nylon","Patent Leather","Plastic","Polycotton","Polyester","Polyethylene","Polyurethane","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Boat Shoe","Clog","Espadrille","Fisherman","Flip Flop","Loafer","Moccasin","Mule","Slide","Slip-On","Sneaker","Sock"]},"Type":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Casual"]},"Performance/Activity":{"present":false,"required":false,"mode":null,"cardinality":null,"enabledForVariations":null,"values":[]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Men","Teens","Unisex Adults"]}}},
  "53120": {"id":"53120","name":"Dress Shoes","path":"Clothing, Shoes & Accessories > Men > Men's Shoes > Dress Shoes","requiredAspects":["Brand","US Shoe Size","Color","Department","Style","Upper Material"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["2","2.5","3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20"]},"Upper Material":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cotton","100% Silk","100% Wool","Bullhide Leather","Cashmere","Cotton","Cotton Blend","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Fur","Hemp","Leather","Linen","Linen Blend","Lyocell","Mohair","Nubuck","Nylon","Patent Leather","Polycotton","Polyester","Polyethylene","Polyurethane","Silk","Silk Blend","Spandex","Suede","Synthetic","Vinyl","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Brogue","Derby","Monk Strap","Oxford"]},"Type":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Dress"]},"Performance/Activity":{"present":false,"required":false,"mode":null,"cardinality":null,"enabledForVariations":null,"values":[]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Men","Teens","Unisex Adults"]}}},
  "11504": {"id":"11504","name":"Sandals","path":"Clothing, Shoes & Accessories > Men > Men's Shoes > Sandals","requiredAspects":["Brand","US Shoe Size","Department","Style","Color","Upper Material"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["2","2.5","3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20"]},"Upper Material":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cotton","100% Silk","100% Wool","Angora","Bamboo","Bullhide Leather","Cork","Cotton","Cotton Blend","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Fur","Hemp","Leather","Lyocell","Mesh","Mohair","Nubuck","Nylon","Patent Leather","PLA Fiber","Plastic","Polyamide","Polycotton","Polyester","Polyethylene","Polyurethane","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Vinyl","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Flip Flop","Slide","Slip-On","Thong"]},"Type":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Sandal"]},"Performance/Activity":{"present":false,"required":false,"mode":null,"cardinality":null,"enabledForVariations":null,"values":[]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Men","Teens","Unisex Adults"]}}},
  "11505": {"id":"11505","name":"Slippers","path":"Clothing, Shoes & Accessories > Men > Men's Shoes > Slippers","requiredAspects":["Brand","Style","Upper Material","Color","Department","US Shoe Size"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["2","2.5","3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20"]},"Upper Material":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cashmere","100% Cotton","100% Silk","100% Wool","Acrylic","Alpaca","Angora","Bamboo","Bullhide Leather","Camel","Cashmere","Cork","Cotton","Cotton Blend","Cupro","Fabric","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Flax","Fur","Hemp","Leather","Linen","Linen Blend","Lyocell","Mesh","Microfiber","Modal","Mohair","Nubuck","Nylon","Patent Leather","PLA Fiber","Plastic","Polyamide","Polycotton","Polyester","Polyethylene","Polyimide","Polyurethane","PVC","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Vinyl","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Bootie","Clog","Fisherman","Flat","Loafer","Moccasin","Mule","Platform","Shearling Style","Slide","Slip-On"]},"Type":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Slipper"]},"Performance/Activity":{"present":false,"required":false,"mode":null,"cardinality":null,"enabledForVariations":null,"values":[]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Men","Teens","Unisex Adults"]}}},
  "95672": {"id":"95672","name":"Athletic Shoes","path":"Clothing, Shoes & Accessories > Women > Women's Shoes > Athletic Shoes","requiredAspects":["Brand","US Shoe Size","Department","Color"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20","20.5","21","21.5"]},"Upper Material":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cashmere","100% Cotton","100% Silk","100% Wool","Acetate","Acrylic","Alpaca","Angora","Bamboo","Breathable Mesh","Bullhide Leather","Calfskin","Camel","Canvas","Cashmere","Corduroy","Cork","Cotton","Cotton Blend","Cupro","Denim","Engineered Knit","Engineered Mesh","Fabric","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Flax","Flexweave","Flymesh","Foamposite","Fur","Glitter","Gripknit","Hemp","Hyperfuse","Intelliknit","Jacquard","Jute","Knit","Knitted","Lace","Leather","Linen","Linen Blend","Lyocell","Mesh","Modal","Mohair","Neoprene","Nubuck","Nylon","Patent Leather","PLA Fiber","Plastic","Polyamide","Polycotton","Polyester","Polyethylene","Polyimide","Polyurethane","Pony Hair","Primeknit+","Primeknit 360","PVC","Recycled Polyester","Ripstop","Rubber","Satin","Sequin","Shearling","Sherpa","Silk","Silk Blend","Snakeskin","Space Waste Yarn","Spandex","Suede","Synthetic","Sythetic","Textile","Tweed","Twill","Vinyl","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":true,"values":["Sneaker"]},"Type":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Athletic"]},"Performance/Activity":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"MULTI","enabledForVariations":true,"values":["Baseball","Basketball","Beach","Bodybuilding","Bowling","Boxing","Cheerleading","CrossFit","Cross Training","Cycling","Dance","Driving","Fishing","Football","Golf","Gym & Training","Hiking","Hockey","Hunting","Lacrosse","Military","Motorcycle","Netball","Pilates","Racing","Riding","Rugby","Running & Jogging","School","Skateboarding","Skiing","Soccer","Squash","Tennis","Track & Field","Typing","Volleyball","Walking","Water Sports","Weightlifting","Wrestling","Yoga"]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Copper","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Women","Teens","Unisex Adults"]}}},
  "53557": {"id":"53557","name":"Boots","path":"Clothing, Shoes & Accessories > Women > Women's Shoes > Boots","requiredAspects":["Brand","US Shoe Size","Style","Color","Department","Upper Material"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20","20.5","21","21.5"]},"Upper Material":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cotton","100% Silk","100% Wool","Bullhide Leather","Cashmere","Cotton","Cotton Blend","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Fur","Hemp","Jute","Leather","Linen","Linen Blend","Lyocell","Mohair","Nubuck","Nylon","Patent Leather","Plastic","Polyamide","Polycotton","Polyester","Polyethylene","Polyurethane","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Vinyl","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Biker","Bootie","Chelsea","Chukka","Combat","Desert","Platform","Rain Boot","Riding Boot","Shearling Style","Slip-On","Snow Boot","Sock","Western"]},"Type":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Boot"]},"Performance/Activity":{"present":false,"required":false,"mode":null,"cardinality":null,"enabledForVariations":null,"values":[]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Women","Teens","Unisex Adults"]}}},
  "53548": {"id":"53548","name":"Comfort Shoes","path":"Clothing, Shoes & Accessories > Women > Women's Shoes > Comfort Shoes","requiredAspects":["Brand","Style","Color","Department","Type","US Shoe Size","Upper Material"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20","20.5","21","21.5"]},"Upper Material":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cashmere","100% Cotton","100% Silk","100% Wool","Acetate","Acrylic","Alpaca","Angora","Bamboo","Bullhide Leather","Camel","Cashmere","Cork","Cotton","Cotton Blend","Cupro","Fabric","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Flax","Fur","Hemp","Jute","Leather","Linen","Linen Blend","Lyocell","Mesh","Microfiber","Modal","Mohair","Nubuck","Nylon","Patent Leather","PLA Fiber","Plastic","Polyamide","Polycotton","Polyester","Polyethylene","Polyimide","Polyurethane","PVC","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Vinyl","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Ballet","Biker","Boat Shoe","Bootie","Clog","Combat","Espadrille","Fisherman","Flat","Flip Flop","Loafer","Mary Jane","Moccasin","Mule","Oxford","Rain Boot","Shearling Style","Slide","Slingback","Slip-On","Sneaker","Snow Boot","Sock","Strappy","Thong","Western"]},"Type":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Boot","Casual","Flat","Sandal","Slipper"]},"Performance/Activity":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"MULTI","enabledForVariations":true,"values":["Baseball","Basketball","Beach","Bodybuilding","Bowling","Boxing","Cheerleading","CrossFit","Cross Training","Cycling","Dance","Driving","Fishing","Football","Golf","Gym & Training","Hiking","Hockey","Hunting","Lacrosse","Military","Motorcycle","Netball","Pilates","Racing","Riding","Rugby","Running & Jogging","School","Skateboarding","Skiing","Soccer","Squash","Tennis","Track & Field","Typing","Volleyball","Walking","Water Sports","Weightlifting","Wrestling","Yoga"]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Women","Teens","Unisex Adults"]}}},
  "45333": {"id":"45333","name":"Flats","path":"Clothing, Shoes & Accessories > Women > Women's Shoes > Flats","requiredAspects":["Brand","US Shoe Size","Style","Color","Department","Upper Material"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20","20.5","21","21.5"]},"Upper Material":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cotton","100% Silk","100% Wool","Bullhide Leather","Cashmere","Cotton","Cotton Blend","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Fur","Hemp","Leather","Linen","Linen Blend","Lyocell","Microfiber","Mohair","Nubuck","Nylon","Patent Leather","Plastic","Polycotton","Polyester","Polyethylene","Polyurethane","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Vinyl","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Ballet","Boat Shoe","Bootie","Flat","Loafer","Mary Jane","Moccasin","Slide","Slingback","Slip-On"]},"Type":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Flat"]},"Performance/Activity":{"present":false,"required":false,"mode":null,"cardinality":null,"enabledForVariations":null,"values":[]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Women","Teens","Unisex Adults"]}}},
  "55793": {"id":"55793","name":"Heels","path":"Clothing, Shoes & Accessories > Women > Women's Shoes > Heels","requiredAspects":["Brand","US Shoe Size","Color","Style","Department","Upper Material"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20","20.5","21","21.5"]},"Upper Material":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"MULTI","enabledForVariations":true,"values":["100% Cotton","100% Silk","100% Wool","Bullhide Leather","Cashmere","Cork","Cotton","Cotton Blend","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Fur","Hemp","Leather","Linen","Linen Blend","Lyocell","Mohair","Nubuck","Nylon","Patent Leather","Plastic","Polycotton","Polyester","Polyethylene","Polyurethane","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Vinyl","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["D'Orsay","Espadrille","Gladiator","Mule","Platform","Pump","Slingback","Strappy","Thong"]},"Type":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Heel"]},"Performance/Activity":{"present":false,"required":false,"mode":null,"cardinality":null,"enabledForVariations":null,"values":[]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Women","Teens","Unisex Adults"]}}},
  "62107": {"id":"62107","name":"Sandals","path":"Clothing, Shoes & Accessories > Women > Women's Shoes > Sandals","requiredAspects":["Brand","US Shoe Size","Style","Color","Department","Upper Material"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20","20.5","21","21.5"]},"Upper Material":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cotton","100% Silk","100% Wool","Bullhide Leather","Cashmere","Cork","Cotton","Cotton Blend","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Fur","Hemp","Leather","Linen","Linen Blend","Lyocell","Mohair","Nubuck","Nylon","Patent Leather","Plastic","Polycotton","Polyester","Polyethylene","Polyurethane","PVC","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["D'Orsay","Espadrille","Fisherman","Flat","Flip Flop","Gladiator","Slide","Slingback","Slip-On","Strappy","Thong"]},"Type":{"present":true,"required":false,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Sandal"]},"Performance/Activity":{"present":false,"required":false,"mode":null,"cardinality":null,"enabledForVariations":null,"values":[]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Women","Teens","Unisex Adults"]}}},
  "11632": {"id":"11632","name":"Slippers","path":"Clothing, Shoes & Accessories > Women > Women's Shoes > Slippers","requiredAspects":["Brand","Style","Color","Department","US Shoe Size","Upper Material"],"brand":{"present":true,"required":true},"conditions":{"required":true,"conditions":[{"id":"1000","name":"New with box"},{"id":"1500","name":"New without box"},{"id":"1750","name":"New with defects"},{"id":"2990","name":"Pre-owned - Excellent"},{"id":"3000","name":"Pre-owned - Good"},{"id":"3010","name":"Pre-owned - Fair"}]},"aspects":{"US Shoe Size":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["3","3.5","4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","13.5","14","14.5","15","15.5","16","16.5","17","17.5","18","18.5","19","19.5","20","20.5","21","21.5"]},"Upper Material":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["100% Cashmere","100% Cotton","100% Silk","100% Wool","Acrylic","Alpaca","Angora","Bamboo","Bullhide Leather","Camel","Cashmere","Cork","Cotton","Cotton Blend","Cupro","Fabric","Faux Fur","Faux Leather","Faux Silk","Faux Suede","Flax","Fur","Hemp","Leather","Linen","Linen Blend","Lyocell","Mesh","Microfiber","Modal","Mohair","Nubuck","Nylon","Patent Leather","PLA Fiber","Plastic","Polyamide","Polycotton","Polyester","Polyethylene","Polyimide","Polyurethane","PVC","Rubber","Silk","Silk Blend","Spandex","Suede","Synthetic","Vinyl","Viscose","Wool","Wool Blend"]},"Shoe Width":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Standard","A","AA","AAA","AAAA","B","C","D","E","EE","EEE","EEEE","EEEEE","EEEEEE","F","G","H","M","N","R","W"]},"Style":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Ballet","Bootie","Clog","Fisherman","Flat","Flip Flop","Loafer","Moccasin","Mule","Platform","Shearling Style","Slide","Slip-On","Sock","Thong"]},"Type":{"present":true,"required":false,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":false,"values":["Slipper"]},"Performance/Activity":{"present":false,"required":false,"mode":null,"cardinality":null,"enabledForVariations":null,"values":[]},"Color":{"present":true,"required":true,"mode":"FREE_TEXT","cardinality":"SINGLE","enabledForVariations":true,"values":["Beige","Black","Blue","Brown","Clear","Gold","Gray","Green","Ivory","Multicolor","Orange","Pink","Purple","Red","Silver","White","Yellow"]},"Department":{"present":true,"required":true,"mode":"SELECTION_ONLY","cardinality":"SINGLE","enabledForVariations":false,"values":["Women","Teens","Unisex Adults"]}}}
};

// ── Shoe Group → eBay Category routing ─
// Keys are actual CL_SHOE_CATS internal category strings
// Verified from Decision #5 research: Internal category -> eBay core category ID
const CL_SHOE_ROUTING = {
  'mens': {
    'Sneakers': 15709, 'Running': 15709, 'Athletic': 15709, 'Basketball': 15709,
    'Casual': 24087, 'Dress Shoes': 53120, 'Boots': 11498, 'Ankle Boots': 11498,
    'Sandals': 11504, 'Heels': 53120, 'Flats': 24087, 'Loafers': 53120, 'Slip-On': 24087,
    'Clogs': 24087, 'Mules': 24087, 'Wedges': 24087, 'Platform': 24087, 'Kids Sneakers': 15709, 'Kids Boots': 11498
  },
  'womens': {
    'Sneakers': 95672, 'Running': 95672, 'Athletic': 95672, 'Basketball': 95672,
    'Casual': 45333, 'Dress Shoes': 55793, 'Boots': 53557, 'Ankle Boots': 53557,
    'Sandals': 62107, 'Heels': 55793, 'Flats': 45333, 'Loafers': 45333, 'Slip-On': 45333,
    'Clogs': 53548, 'Mules': 45333, 'Wedges': 55793, 'Platform': 55793, 'Kids Sneakers': 95672, 'Kids Boots': 57974
  },
  'boys': {
    'Sneakers': 57929, 'Running': 57929, 'Athletic': 57929, 'Basketball': 57929,
    'Casual': 57929, 'Dress Shoes': 57929, 'Boots': 57929, 'Ankle Boots': 57929,
    'Sandals': 57929, 'Heels': 57929, 'Flats': 57929, 'Loafers': 57929, 'Slip-On': 57929,
    'Clogs': 57929, 'Mules': 57929, 'Wedges': 57929, 'Platform': 57929, 'Kids Sneakers': 57929, 'Kids Boots': 57929
  },
  'girls': {
    'Sneakers': 57974, 'Running': 57974, 'Athletic': 57974, 'Basketball': 57974,
    'Casual': 57974, 'Dress Shoes': 57974, 'Boots': 57974, 'Ankle Boots': 57974,
    'Sandals': 57974, 'Heels': 57974, 'Flats': 57974, 'Loafers': 57974, 'Slip-On': 57974,
    'Clogs': 57974, 'Mules': 57974, 'Wedges': 57974, 'Platform': 57974, 'Kids Sneakers': 57974, 'Kids Boots': 57974
  },
  'unisex': {
    'Sneakers': 15709, 'Running': 15709, 'Athletic': 15709, 'Basketball': 15709,
    'Casual': 53548, 'Dress Shoes': 53120, 'Boots': 11498, 'Ankle Boots': 53557,
    'Sandals': 11504, 'Heels': 55793, 'Flats': 45333, 'Loafers': 24087, 'Slip-On': 24087,
    'Clogs': 53548, 'Mules': 53548, 'Wedges': 55793, 'Platform': 95672
  },
  'unisex_kids': {
    'Kids Sneakers': 155202, 'Kids Boots': 155202
  }
};

// ── Shoe Group → Department (eBay item specific) ─
const CL_SHOE_DEPT_MAP = {
  'mens': 'Men',
  'womens': 'Women',
  'boys': 'Boys',
  'girls': 'Girls',
  'unisex_kids': 'Unisex Kids',
  'baby': 'Unisex Baby & Toddler',
  'unisex': 'Unisex Adults'
};

// ── Condition Code → eBay Condition ID ─
const CL_SHOE_CONDITION_MAP = {
  'NEW_WITH_BOX': 1000,
  'NEW_WITHOUT_BOX': 1500,
  'NEW_WITH_DEFECTS': 1750,
  'PREOWNED_EXCELLENT': 2990,
  'PREOWNED_GOOD': 3000,
  'PREOWNED_FAIR': 3010
};

// ── sourceCategory → eBay Style Mapping ─
const CL_SHOE_SOURCE_TO_STYLE = {
  'Sneakers': 'Sneaker',
  'Running': 'Sneaker',
  'Athletic': 'Sneaker',
  'Basketball': 'Sneaker',
  'Kids Sneakers': 'Sneaker',
  'Casual': 'Slip-On',
  'Dress Shoes': 'Oxford',
  'Boots': 'Boot',
  'Ankle Boots': 'Boot',
  'Sandals': 'Slide',
  'Heels': 'Platform',
  'Flats': 'Flat',
  'Loafers': 'Loafer',
  'Slip-On': 'Slip-On',
  'Clogs': 'Clog',
  'Mules': 'Mule',
  'Wedges': 'Platform',
  'Platform': 'Platform',
  'Kids Boots': 'Boot'
};

// ── sourceCategory → eBay Type Mapping ─
const CL_SHOE_SOURCE_TO_TYPE = {
  'Sneakers': 'Athletic',
  'Running': 'Athletic',
  'Athletic': 'Athletic',
  'Basketball': 'Athletic',
  'Kids Sneakers': 'Athletic',
  'Casual': 'Casual',
  'Dress Shoes': 'Dress',
  'Boots': 'Boot',
  'Ankle Boots': 'Boot',
  'Sandals': 'Sandal',
  'Heels': 'Heel',
  'Flats': 'Flat',
  'Loafers': 'Casual',
  'Slip-On': 'Casual',
  'Clogs': 'Casual',
  'Mules': 'Casual',
  'Wedges': 'Heel',
  'Platform': 'Casual',
  'Kids Boots': 'Boot'
};

// ═══════════════════════════════════════════════════════════════════════════
// Pure Functions
// ═══════════════════════════════════════════════════════════════════════════

function clIsShoeRow(row) {
  return !!row && row.itemType === 'shoes';
}

function clShoeDeptFor(row) {
  return CL_SHOE_DEPT_MAP[row.shoeGroup];
}

function clGetShoeEbayCategoryIdFor(row) {
  var groupRouting = CL_SHOE_ROUTING[row.shoeGroup];
  if (!groupRouting) return undefined;
  return groupRouting[row.sourceCategory];
}

function clGetShoeConditionIdFor(row) {
  if (!row || !row.condition) return undefined;
  return CL_SHOE_CONDITION_MAP[row.condition];
}

function clBuildEbayRowData(input) {
  var row = {
    itemType: input.itemType || '',
    gender: input.gender || '',
    shoeGroup: input.shoeGroup || '',
    sourceCategory: input.sourceCategory || '',
    condition: input.condition || '',
    sku: input.sku || '',
    photos: input.photos || '',
    title: input.title || '',
    category: input.category || '',
    categoryId: input.categoryId,
    conditionId: input.conditionId,
    aspects: input.aspects || {},
    brand: input.brand || '',
    brandCustom: input.brandCustom || '',
    sizeType: input.sizeType || '',
    size: input.size || '',
    department: input.department,
    color: input.color || '',
    colorCustom: input.colorCustom || '',
    style: input.style || '',
    inseam: input.inseam || '',
    dressLength: input.dressLength || '',
    outerMaterial: input.outerMaterial || '',
    swimStyle: input.swimStyle || '',
    activity: input.activity || '',
    shoeWidth: input.shoeWidth || '',
    type: input.type || '',
    description: input.description || '',
    price: input.price || '',
    location: input.location || '',
    warehouseLocation: input.warehouseLocation || '',
    weightMajor: input.weightMajor === '' || input.weightMajor == null ? '' : input.weightMajor,
    weightMinor: input.weightMinor === '' || input.weightMinor == null ? '' : input.weightMinor,
    weightTotalLb: input.weightTotalLb || '',
    weightLabel: input.weightLabel || ''
  };

  if (clIsShoeRow(row)) {
    row.gender = '';
    row.categoryId = clGetShoeEbayCategoryIdFor(row);
    row.conditionId = clGetShoeConditionIdFor(row);
    row.department = clShoeDeptFor(row);
  } else {
    row.shoeGroup = '';
  }

  return row;
}

function clClassifySessionRow(row) {
  if (!row) return 'ambiguous';
  if (row.itemType === 'shoes') return 'shoes';
  if (row.itemType === 'clothing') return 'clothing';
  if (!row.itemType) {
    if (row.shoeGroup) return 'shoes';
    return 'ambiguous';
  }
  return 'ambiguous';
}

function clResolveShoeEbayAspects(row) {
  if (!row || !row.itemType || row.itemType !== 'shoes') {
    return { ok: false, code: 'NOT_SHOE', message: 'Not a shoe row' };
  }

  // Step 1: Check shoeGroup
  if (!row.shoeGroup) {
    return { ok: false, code: 'MISSING_SHOE_GROUP', field: 'shoeGroup', message: 'Missing shoeGroup' };
  }

  // Step 2: Check sourceCategory
  if (!row.sourceCategory) {
    return { ok: false, code: 'MISSING_SOURCE_CATEGORY', field: 'sourceCategory', message: 'Missing sourceCategory' };
  }
  if (row.sourceCategory === 'Other') {
    return { ok: false, code: 'INVALID_SOURCE_CATEGORY', field: 'sourceCategory', value: row.sourceCategory, message: 'Cannot use "Other" as shoe category' };
  }

  // Step 3: Check routing exists and get categoryId
  var categoryId = clGetShoeEbayCategoryIdFor(row);
  if (!categoryId) {
    return { ok: false, code: 'UNSUPPORTED_CATEGORY', field: 'sourceCategory', value: row.sourceCategory, message: 'No approved routing for this shoe category' };
  }

  // Step 4: Verify categoryId matches row
  if (parseInt(row.categoryId) !== categoryId) {
    return { ok: false, code: 'CATEGORY_MISMATCH', field: 'categoryId', value: row.categoryId, expected: categoryId, message: 'Category ID mismatch with routing' };
  }

  // Step 5: Get and validate taxonomy
  var taxonomy = CL_SHOE_TAXONOMY[String(categoryId)];
  if (!taxonomy) {
    return { ok: false, code: 'NO_TAXONOMY', field: 'categoryId', value: categoryId, message: 'Taxonomy not found for category ' + categoryId };
  }

  // Step 6: Check condition
  if (!row.condition) {
    return { ok: false, code: 'MISSING_CONDITION', field: 'condition', message: 'Missing condition' };
  }
  var conditionId = clGetShoeConditionIdFor(row);
  if (!conditionId) {
    return { ok: false, code: 'INVALID_CONDITION', field: 'condition', value: row.condition, message: 'Invalid condition' };
  }
  if (parseInt(row.conditionId) !== conditionId) {
    return { ok: false, code: 'CONDITION_MISMATCH', field: 'conditionId', value: row.conditionId, expected: conditionId, message: 'Condition ID mismatch' };
  }

  // Step 7: Validate BRAND
  var brandAspect = taxonomy.aspects && taxonomy.aspects.Brand || taxonomy.brand;
  if (brandAspect && brandAspect.required && (!row.brand || row.brand === '' || row.brand === 'Other')) {
    if (row.brand === 'Other' && !row.brandCustom) {
      return { ok: false, code: 'MISSING_BRAND', field: 'brand', message: 'Brand is required; "Other" requires custom brand' };
    }
    var brandToUse = row.brand === 'Other' ? row.brandCustom : row.brand;
    if (!brandToUse) {
      return { ok: false, code: 'MISSING_BRAND', field: 'brand', message: 'Brand is required' };
    }
  }
  var usedBrand = row.brand === 'Other' ? row.brandCustom : row.brand;

  // Step 8: Validate US SHOE SIZE
  var sizeAspect = taxonomy.aspects['US Shoe Size'];
  if (sizeAspect) {
    if (sizeAspect.required && (!row.size || row.size === '')) {
      return { ok: false, code: 'MISSING_SIZE', field: 'size', message: 'US Shoe Size is required' };
    }
    if (row.size && sizeAspect.values && sizeAspect.values.length > 0) {
      if (!sizeAspect.values.includes(row.size)) {
        return { ok: false, code: 'INVALID_SIZE', field: 'size', value: row.size, message: 'Invalid US Shoe Size for this category' };
      }
    }
  }

  // Step 9: Validate COLOR
  var colorAspect = taxonomy.aspects.Color;
  if (colorAspect) {
    var colorValue = row.color === 'Other' ? row.colorCustom : row.color;
    if (colorAspect.required && (!colorValue || colorValue === '')) {
      return { ok: false, code: 'MISSING_COLOR', field: 'color', message: 'Color is required' };
    }
    if (colorValue && colorAspect.values && colorAspect.values.length > 0) {
      if (!colorAspect.values.includes(colorValue)) {
        return { ok: false, code: 'INVALID_COLOR', field: 'color', value: colorValue, message: 'Invalid Color for this category' };
      }
    }
  }
  var usedColor = row.color === 'Other' ? row.colorCustom : row.color;

  // Step 10: Validate DEPARTMENT
  var deptAspect = taxonomy.aspects.Department;
  if (deptAspect) {
    var deptValue = clShoeDeptFor(row);
    if (deptAspect.required && (!deptValue || deptValue === '')) {
      return { ok: false, code: 'MISSING_DEPARTMENT', field: 'department', message: 'Department is required' };
    }
    if (deptValue && deptAspect.values && deptAspect.values.length > 0) {
      if (!deptAspect.values.includes(deptValue)) {
        return { ok: false, code: 'INVALID_DEPARTMENT', field: 'department', value: deptValue, message: 'Department not allowed for this category' };
      }
    }
  }

  // Step 11: Validate UPPER MATERIAL
  var materialAspect = taxonomy.aspects['Upper Material'];
  if (materialAspect) {
    if (materialAspect.required && (!row.outerMaterial || row.outerMaterial === '')) {
      return { ok: false, code: 'MISSING_UPPER_MATERIAL', field: 'outerMaterial', message: 'Upper Material is required for this category' };
    }
    if (row.outerMaterial && materialAspect.values && materialAspect.values.length > 0) {
      if (!materialAspect.values.includes(row.outerMaterial)) {
        return { ok: false, code: 'INVALID_UPPER_MATERIAL', field: 'outerMaterial', value: row.outerMaterial, message: 'Invalid Upper Material for this category' };
      }
    }
  }

  // Step 12: Validate SHOE WIDTH
  var widthAspect = taxonomy.aspects['Shoe Width'];
  if (widthAspect) {
    if (widthAspect.required && (!row.shoeWidth || row.shoeWidth === '')) {
      return { ok: false, code: 'MISSING_SHOE_WIDTH', field: 'shoeWidth', message: 'Shoe Width is required for this category' };
    }
    if (row.shoeWidth && widthAspect.values && widthAspect.values.length > 0) {
      if (!widthAspect.values.includes(row.shoeWidth)) {
        return { ok: false, code: 'INVALID_SHOE_WIDTH', field: 'shoeWidth', value: row.shoeWidth, message: 'Invalid Shoe Width for this category' };
      }
    }
  }

  // Step 13: Validate STYLE (derived from sourceCategory)
  var styleAspect = taxonomy.aspects.Style;
  var derivedStyle = CL_SHOE_SOURCE_TO_STYLE[row.sourceCategory];
  if (styleAspect) {
    if (styleAspect.required && !derivedStyle) {
      return { ok: false, code: 'MISSING_STYLE', field: 'style', message: 'Cannot derive eBay Style from this category' };
    }
    if (derivedStyle && styleAspect.values && styleAspect.values.length > 0) {
      if (!styleAspect.values.includes(derivedStyle)) {
        return { ok: false, code: 'INVALID_STYLE', field: 'style', value: derivedStyle, message: 'Derived Style not valid for this category' };
      }
    }
  }

  // Step 14: Validate TYPE (derived from sourceCategory)
  var typeAspect = taxonomy.aspects.Type;
  var derivedType = CL_SHOE_SOURCE_TO_TYPE[row.sourceCategory];
  if (typeAspect) {
    if (typeAspect.required && !derivedType) {
      return { ok: false, code: 'MISSING_TYPE', field: 'type', message: 'Cannot derive eBay Type from this category' };
    }
    if (derivedType && typeAspect.values && typeAspect.values.length > 0) {
      if (!typeAspect.values.includes(derivedType)) {
        return { ok: false, code: 'INVALID_TYPE', field: 'type', value: derivedType, message: 'Derived Type not valid for this category' };
      }
    }
  }

  // Step 15: Validate PERFORMANCE/ACTIVITY
  var activityAspect = taxonomy.aspects['Performance/Activity'];
  var activity = '';
  if (row.activity) {
    // Explicit activity: validate against taxonomy
    if (activityAspect) {
      if (activityAspect.values && activityAspect.values.length > 0) {
        if (!activityAspect.values.includes(row.activity)) {
          return { ok: false, code: 'INVALID_ACTIVITY', field: 'activity', value: row.activity, message: 'Invalid Performance/Activity for this category' };
        }
      }
    }
    activity = row.activity;
  } else {
    // No explicit activity: try to derive from sourceCategory
    var derivedActivity = clGetDerivedShoeActivity(row.sourceCategory);
    if (derivedActivity && activityAspect) {
      if (activityAspect.values && activityAspect.values.length > 0) {
        if (activityAspect.values.includes(derivedActivity)) {
          activity = derivedActivity;
        }
      }
    }
  }

  // Build result
  return {
    ok: true,
    categoryId: categoryId,
    conditionId: conditionId,
    department: clShoeDeptFor(row),
    size: row.size || '',
    color: usedColor || '',
    style: derivedStyle || '',
    ebayType: derivedType || '',
    upperMaterial: row.outerMaterial || '',
    shoeWidth: row.shoeWidth || '',
    activity: activity,
    brand: usedBrand || ''
  };
}

function clValidateShoeExport(session) {
  for (var i = 0; i < session.length; i++) {
    var row = session[i];

    if (!row.itemType) {
      return { ok: false, error: 'Row '+(i+1)+': legacy row without itemType. Please re-scan or recreate.' };
    }

    if (!clIsShoeRow(row)) continue;

    var resolved = clResolveShoeEbayAspects(row);
    if (!resolved.ok) {
      var sku = row.sku || '(no SKU)';
      var title = row.title || '(no title)';
      return {
        ok: false,
        error: 'Row '+(i+1)+' (SKU: '+sku+'): '+resolved.message,
        rowIndex: i+1,
        sku: sku,
        title: title,
        code: resolved.code,
        field: resolved.field,
        value: resolved.value,
        expected: resolved.expected
      };
    }
  }
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// Public API (same for browser and Node.js)
// ═══════════════════════════════════════════════════════════════════════════

function clBuildEbayHeader(hasShoes) {
  var HDR = [
    '*Action(SiteID=US|Country=US|Currency=USD|Version=1193|CC=UTF-8)',
    'CustomLabel','*Category','*Title','*ConditionID',
    '*C:Brand','*C:Size Type','*C:Size','*C:Department','*C:Color','*C:Style','C:Type',
    'C:Inseam','C:Dress Length','C:Outer Shell Material','C:Performance/Activity','C:Width',
    'PicURL','*Description','*Format','*Duration',
    '*StartPrice','*Quantity','ImmediatePayRequired','*Location','*DispatchTimeMax',
    'ShippingProfileName','ReturnProfileName','PaymentProfileName',
    'WeightMajor','WeightMinor'
  ];
  if (hasShoes) {
    HDR.push('C:US Shoe Size','C:Upper Material','C:Shoe Width');
  }
  return HDR;
}

function clBuildEbayCsvRow(row, hasShoes, config) {
  var q = function(v) {
    v = String(v==null?'':v);
    return (v.indexOf(',')>=0||v.indexOf('"')>=0||v.indexOf('\n')>=0)
      ? '"'+v.replace(/"/g,'""')+'"' : v;
  };

  config = config || {};
  var SHIP = config.shippingProfile || 'STANDARD';
  var RET = config.returnProfile || 'STANDARD';
  var PAY = config.paymentProfile || 'STANDARD';

  var isShoe = clIsShoeRow(row);

  // Resolve shoe taxonomy for shoes (fail closed if invalid)
  var resolved = null;
  if (isShoe) {
    resolved = clResolveShoeEbayAspects(row);
    if (!resolved.ok) {
      return { ok: false, error: resolved };
    }
  }

  var needsInseam = ['Jeans','Pants','Shorts'].includes(row.type);
  var needsDressLen = ['Dress','Skirt'].includes(row.type);
  var needsOuter = ['Jacket','Coat','Vest'].includes(row.type);
  var needsActivity = ['Activewear Top','Activewear Bottom'].includes(row.type);

  function asp(v){
    var s = String(v == null ? '' : v).trim();
    return /^(unspecified|unknown|n\/a|na|none|not specified|select|--)$/i.test(s) ? '' : s;
  }

  var rowData = [
    'Add',row.sku||'',
    isShoe ? resolved.categoryId : row.categoryId,
    row.title||'',
    isShoe ? resolved.conditionId : row.conditionId,
    isShoe ? resolved.brand : (row.brand||''),
    isShoe ? '' : (row.sizeType||'Regular'),
    isShoe ? '' : (row.size||''),
    isShoe ? resolved.department : (row.department||''),
    isShoe ? resolved.color : asp(row.color),
    isShoe ? resolved.style : asp(row.style),
    isShoe ? resolved.ebayType : asp(row.type),
    isShoe ? '' : (asp(row.inseam) || (needsInseam ? (row.type === 'Shorts' ? '9"' : '30"') : '')),
    isShoe ? '' : (asp(row.dressLength) || (needsDressLen ? 'Knee Length' : '')),
    isShoe ? '' : (asp(row.outerMaterial) || (needsOuter ? 'Polyester' : '')),
    isShoe ? resolved.activity : (asp(row.activity) || (needsActivity ? 'General Fitness' : '')),
    isShoe ? '' : (asp(row.shoeWidth) || ''),
    row.photos||'',
    row.description||('<p>'+(row.title||'')+'</p>'),
    'FixedPrice','GTC',row.price||'19.99','1','1','Lumberton, NC','1',SHIP,RET,PAY,
    (row.weightMajor === '' || row.weightMajor == null) ? '' : row.weightMajor,
    (row.weightMinor === '' || row.weightMinor == null) ? '' : row.weightMinor
  ];

  if (hasShoes) {
    if (isShoe) {
      rowData.push(resolved.size, resolved.upperMaterial, resolved.shoeWidth);
    } else {
      rowData.push('', '', '');
    }
  }

  return { ok: true, csv: rowData.map(q).join(',') };
}

// ═══════════════════════════════════════════════════════════════════════════
// UI/Taxonomy Helper Functions (Decision #6, Phase 2)
// ═══════════════════════════════════════════════════════════════════════════

function clGetShoeAllowedCategories(shoeGroup) {
  // Return exact routing keys for this shoe group
  // Empty array if unsupported group
  if (!shoeGroup) return [];
  if (shoeGroup === 'baby') return []; // Baby unsupported
  var routingKey = shoeGroup.toLowerCase().replace(/ /g, '_');
  var routing = CL_SHOE_ROUTING[routingKey];
  if (!routing) return [];
  // Return exact Object.keys from the routing table
  return Object.keys(routing);
}

function clGetShoeTaxonomyForSelection(shoeGroup, sourceCategory) {
  // Get the eBay category ID and taxonomy for this selection
  if (!shoeGroup || !sourceCategory) return null;
  if (shoeGroup === 'baby') return null;
  var routingKey = shoeGroup.toLowerCase().replace(/ /g, '_');
  var routing = CL_SHOE_ROUTING[routingKey];
  if (!routing) return null;
  var categoryId = routing[sourceCategory];
  if (!categoryId) return null;
  return CL_SHOE_TAXONOMY[categoryId] || null;
}

function clGetShoeAllowedSizes(shoeGroup, sourceCategory) {
  // Return exact taxonomy size values
  var tax = clGetShoeTaxonomyForSelection(shoeGroup, sourceCategory);
  if (!tax || !tax.aspects || !tax.aspects['US Shoe Size']) return [];
  return tax.aspects['US Shoe Size'].values || [];
}

function clGetShoeAllowedWidths(shoeGroup, sourceCategory) {
  // Return exact taxonomy width values
  var tax = clGetShoeTaxonomyForSelection(shoeGroup, sourceCategory);
  if (!tax || !tax.aspects || !tax.aspects['Shoe Width']) return [];
  return tax.aspects['Shoe Width'].values || [];
}

function clGetShoeAllowedColors(shoeGroup, sourceCategory) {
  // Return exact taxonomy color values
  var tax = clGetShoeTaxonomyForSelection(shoeGroup, sourceCategory);
  if (!tax || !tax.aspects || !tax.aspects.Color) return [];
  return tax.aspects.Color.values || [];
}

function clGetShoeAllowedUpperMaterials(shoeGroup, sourceCategory) {
  // Return exact taxonomy upper material values
  var tax = clGetShoeTaxonomyForSelection(shoeGroup, sourceCategory);
  if (!tax || !tax.aspects || !tax.aspects['Upper Material']) return [];
  return tax.aspects['Upper Material'].values || [];
}

// ─ Activity Derivation (deterministic mapping from sourceCategory)
const CL_SHOE_SOURCE_TO_ACTIVITY = {
  'Running': 'Running & Jogging',
  'Basketball': 'Basketball'
};

function clGetDerivedShoeActivity(sourceCategory) {
  // Return derived activity if sourceCategory maps deterministically
  return CL_SHOE_SOURCE_TO_ACTIVITY[sourceCategory] || null;
}

// ─ Early validation helper for shoe Item Info (Step 2)
function clValidateShoeItemInfo(input) {
  // Validate shoe fields available at Item Info stage
  // Returns { ok: true } or { ok: false, error: string }
  if (!input.shoeGroup) return { ok: false, error: 'shoeGroup required' };
  if (!input.category) return { ok: false, error: 'category required' };
  if (input.shoeGroup === 'baby') return { ok: false, error: 'Baby shoes unsupported' };

  var tax = clGetShoeTaxonomyForSelection(input.shoeGroup, input.category);
  if (!tax) return { ok: false, error: 'Invalid shoe selection' };

  // Size validation: exact membership in taxonomy
  var allowedSizes = clGetShoeAllowedSizes(input.shoeGroup, input.category);
  if (!input.size || !allowedSizes.includes(input.size)) {
    return { ok: false, error: 'Invalid or missing shoe size' };
  }

  // Color validation: exact membership or Other with custom
  var allowedColors = clGetShoeAllowedColors(input.shoeGroup, input.category);
  if (!input.color) {
    return { ok: false, error: 'Color required' };
  }
  if (input.color === 'Other') {
    if (!input.colorCustom || !input.colorCustom.trim()) {
      return { ok: false, error: 'Custom color required' };
    }
    if (!allowedColors.includes(input.colorCustom)) {
      return { ok: false, error: 'Custom color not in taxonomy' };
    }
  } else if (!allowedColors.includes(input.color)) {
    return { ok: false, error: 'Color not in taxonomy' };
  }

  // Width validation: optional but if provided must be in taxonomy
  if (input.shoeWidth) {
    var allowedWidths = clGetShoeAllowedWidths(input.shoeGroup, input.category);
    if (allowedWidths.length > 0 && !allowedWidths.includes(input.shoeWidth)) {
      return { ok: false, error: 'Invalid shoe width' };
    }
  }

  // Upper Material validation: required if so in taxonomy
  var allowedMaterials = clGetShoeAllowedUpperMaterials(input.shoeGroup, input.category);
  var matAspect = tax.aspects['Upper Material'];
  if (matAspect && matAspect.required) {
    if (!input.outerMaterial || !allowedMaterials.includes(input.outerMaterial)) {
      return { ok: false, error: 'Upper Material required' };
    }
  } else if (input.outerMaterial && allowedMaterials.length > 0 && !allowedMaterials.includes(input.outerMaterial)) {
    return { ok: false, error: 'Invalid Upper Material' };
  }

  return { ok: true };
}

// Reconcile shoe selections when group changes, preserving compatible values
function clReconcileShoeSelectionForGroupChange(opts) {
  const { oldGroup, newGroup, category, size, color, colorCustom, shoeWidth, outerMaterial } = opts;

  let newCategory = category;
  let newSize = size;
  let newColor = color;
  let newColorCustom = colorCustom;
  let newShoeWidth = shoeWidth;
  let newOuterMaterial = outerMaterial;

  // Check if category is valid for new group
  const newAllowedCats = clGetShoeAllowedCategories(newGroup);
  if (!newAllowedCats.includes(category)) {
    newCategory = '';
    // If category isn't valid, dependent fields must clear
    newSize = '';
    newColor = '';
    newColorCustom = '';
    newShoeWidth = '';
    newOuterMaterial = '';
  } else if (newCategory) {
    // Category remains valid; validate each field independently

    // Size validation
    const newAllowedSizes = clGetShoeAllowedSizes(newGroup, newCategory);
    if (!newAllowedSizes.includes(newSize)) {
      newSize = '';
    }

    // Color validation
    const newAllowedColors = clGetShoeAllowedColors(newGroup, newCategory);
    if (newColor === 'Other') {
      // For 'Other', keep only if custom color is a valid taxonomy color
      if (!newAllowedColors.includes(newColorCustom)) {
        newColor = '';
        newColorCustom = '';
      }
    } else if (!newAllowedColors.includes(newColor)) {
      newColor = '';
      newColorCustom = '';
    }

    // Width validation
    const newAllowedWidths = clGetShoeAllowedWidths(newGroup, newCategory);
    if (newShoeWidth && !newAllowedWidths.includes(newShoeWidth)) {
      newShoeWidth = '';
    }

    // Material (outer/upper) validation
    const newAllowedMaterials = clGetShoeAllowedUpperMaterials(newGroup, newCategory);
    if (newOuterMaterial && !newAllowedMaterials.includes(newOuterMaterial)) {
      newOuterMaterial = '';
    }
  }

  return {
    category: newCategory,
    size: newSize,
    color: newColor,
    colorCustom: newColorCustom,
    shoeWidth: newShoeWidth,
    outerMaterial: newOuterMaterial
  };
}

var clShoeEbay = {
  CL_SHOE_TAXONOMY: CL_SHOE_TAXONOMY,
  CL_SHOE_ROUTING: CL_SHOE_ROUTING,
  CL_SHOE_DEPT_MAP: CL_SHOE_DEPT_MAP,
  CL_SHOE_CONDITION_MAP: CL_SHOE_CONDITION_MAP,
  CL_SHOE_SOURCE_TO_STYLE: CL_SHOE_SOURCE_TO_STYLE,
  CL_SHOE_SOURCE_TO_TYPE: CL_SHOE_SOURCE_TO_TYPE,
  clIsShoeRow: clIsShoeRow,
  clShoeDeptFor: clShoeDeptFor,
  clGetShoeEbayCategoryIdFor: clGetShoeEbayCategoryIdFor,
  clGetShoeConditionIdFor: clGetShoeConditionIdFor,
  clBuildEbayRowData: clBuildEbayRowData,
  clValidateShoeExport: clValidateShoeExport,
  clClassifySessionRow: clClassifySessionRow,
  clResolveShoeEbayAspects: clResolveShoeEbayAspects,
  clBuildEbayHeader: clBuildEbayHeader,
  clBuildEbayCsvRow: clBuildEbayCsvRow,
  clGetShoeAllowedCategories: clGetShoeAllowedCategories,
  clGetShoeTaxonomyForSelection: clGetShoeTaxonomyForSelection,
  clGetShoeAllowedSizes: clGetShoeAllowedSizes,
  clGetShoeAllowedWidths: clGetShoeAllowedWidths,
  clGetShoeAllowedColors: clGetShoeAllowedColors,
  clGetShoeAllowedUpperMaterials: clGetShoeAllowedUpperMaterials,
  CL_SHOE_SOURCE_TO_ACTIVITY: CL_SHOE_SOURCE_TO_ACTIVITY,
  clGetDerivedShoeActivity: clGetDerivedShoeActivity,
  clValidateShoeItemInfo: clValidateShoeItemInfo,
  clReconcileShoeSelectionForGroupChange: clReconcileShoeSelectionForGroupChange
};

if (typeof window !== 'undefined') {
  window.clShoeEbay = clShoeEbay;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = clShoeEbay;
}
