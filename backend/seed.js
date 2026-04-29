const db = require('./config/db');

const seedData = [
  {
    name: "Red Velvet Cake",
    price: 250000,
    description: "Bánh kem đỏ sang trọng với lớp sốt cream cheese béo ngậy, kết hợp hương vị cacao nhẹ nhàng và vị chua chua tươi mới. Mềm mại, luscious và hoàn hảo cho những dịp đặc biệt.",
    category_id: 7,
    image: "https://i.pinimg.com/1200x/63/ce/84/63ce84cf5b948ecf95304a25ce8b5834.jpg",
    ingredients: "Flour, butter, sugar, eggs, red food coloring, cocoa powder, cream cheese frosting",
    nutrition: [
      { name: "Calories", value: "320", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "16", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "38", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Triple Berry Tiramisu",
    price: 320000,
    description: "Tiramisu thanh mỹ kết hợp hương cà phê đắng ngọt với mascarpone mềm kem, phủ đầy dâu tây, việt quất và mâm xôi tươi mát. Lớp bánh ladyfinger thấm chừng vừa vặn, tạo nên trải nghiệm vị giác đa chiều.",
    category_id: 7,
    image: "https://i.pinimg.com/1200x/cd/96/85/cd9685de7adb0a8a5b518c26c796a13d.jpg",
    ingredients: "Ladyfinger biscuits, mascarpone, coffee, cocoa powder, strawberries, blueberries, raspberries",
    nutrition: [
      { name: "Calories", value: "280", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "14", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "32", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Chocolate Mousse",
    price: 350000,
    description: "Mousse sô cô la đen sẫm lạnh mát, mịn như tơ với vị chocolate đậm đà xen lẫn caramel thoang thoảng. Cấu trúc nhẹ nhàng, tan chảy trên lưỡi tạo cảm giác tuyệt vời, kết hợp hương bơ nước cốt và cocoa thơm lừng.",
    category_id: 6,
    image: "https://i.pinimg.com/1200x/f4/12/58/f412586f1b3b30153eb531884501d0e9.jpg",
    ingredients: "Dark chocolate, heavy cream, eggs, sugar, butter",
    nutrition: [
      { name: "Calories", value: "350", unit: "kcal", per: "100g" },
      { name: "Protein", value: "6", unit: "g", per: "100g" },
      { name: "Fat", value: "22", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "32", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Matcha-Strawberry Cake",
    price: 295000,
    description: "Bánh kết hợp tinh tế giữa trà xanh Nhật Bản mới lạ với dâu tây tươi mát, kem sinh đôi kỹ thuật cao. Hương matcha thanh mát, chút vị đắng cân bằng hoàn hảo với độ ngọt nhẹ nhàng của dâu tây và kem mềm mịn.",
    category_id: 7,
    image: "https://i.pinimg.com/736x/70/32/79/7032799fc626f6e9d4c602602aaab383.jpg",
    ingredients: "Matcha powder, flour, eggs, sugar, butter, fresh strawberries, whipped cream",
    nutrition: [
      { name: "Calories", value: "290", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "14", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "38", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Blueberry Cheesecake",
    price: 310000,
    description: "Bánh phô mai tươi sáng với đáy bánh quy bơ giòn, phủ đầy sốt việt quất chua ngọt tự nhiên. Lớp cream cheese mềm mại, béo ngậy nhưng không bị ngấy, kết hợp hương chua tươi mát tạo nên sự cân bằng hoàn hảo.",
    category_id: 6,
    image: "https://i.pinimg.com/736x/39/ab/6d/39ab6d5ae5ba51cbd590d579aa55a596.jpg",
    ingredients: "Cream cheese, graham cracker crust, sugar, eggs, sour cream, blueberries",
    nutrition: [
      { name: "Calories", value: "340", unit: "kcal", per: "100g" },
      { name: "Protein", value: "8", unit: "g", per: "100g" },
      { name: "Fat", value: "20", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "34", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Vanilla Birthday Cake",
    price: 450000,
    description: "Bánh sinh nhật cổ điển sang trọng với vị vanilla thơm tinh tế, lớp kem tươi mịn màng phủ ngoài, trang trí fondant tinh tế. Lý tưởng cho những khoảnh khắc đặc biệt, mỗi miếng đều mang đầy yêu thương và kỷ niệm.",
    category_id: 8,
    image: "https://i.pinimg.com/1200x/1c/23/ff/1c23ff8a59a466d9455feb356a431282.jpg",
    ingredients: "Flour, butter, sugar, eggs, vanilla extract, baking powder, cream, fondant",
    nutrition: [
      { name: "Calories", value: "380", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "18", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "48", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Cream Puff (Choux)",
    price: 120000,
    description: "Bộ 10 bánh su kem mini xinh xắn, giòn tan ngay lập tức tạo âm thanh crunch đặc trưng. Nhân kem custard mịn mềm, tươi mát, hoàn hảo để chia sẻ trong tiệc nhỏ hoặc thưởng thức riêng.",
    category_id: 9,
    image: "https://i.pinimg.com/1200x/2e/c2/03/2ec203d98d5a958f950898513431c9f8.jpg",
    ingredients: "Flour, butter, eggs, water, salt, pastry cream, powdered sugar",
    nutrition: [
      { name: "Calories", value: "220", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "12", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "24", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Strawberry Cake",
    price: 150000,
    description: "Bánh dâu tây mềm mại với lớp kem sinh đôi tươi mát, phủ đầy dâu tây đỏ mọng nước. Vị ngọt nhẹ nhàng, hương dâu tây tự nhiên, cấu trúc bánh xốp mịn tạo nên trải nghiệm ăn tuyệt vời.",
    category_id: 7,
    image: "https://i.pinimg.com/1200x/2f/ad/05/2fad055ec92392c060c785024eca5e5e.jpg",
    ingredients: "Flour, butter, sugar, eggs, fresh strawberries, cream, vanilla",
    nutrition: [
      { name: "Calories", value: "280", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "12", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "38", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Chocolate Cake",
    price: 150000,
    description: "Bánh sô cô la đen đậm vị với lớp ganache bóng loáng sang trọng. Mềm ẩm ngay cả sau ngày, vị chocolate sâu sắc xen lẫn hương bơ tươi, mỗi miếng đều tuyệt hảo cho những người yêu chocolate thực thụ.",
    category_id: 7,
    image: "https://i.pinimg.com/736x/69/a0/2a/69a02ac75648c89842d279f0739c0842.jpg",
    ingredients: "Flour, chocolate, butter, sugar, eggs, cocoa powder, baking soda",
    nutrition: [
      { name: "Calories", value: "320", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "15", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "40", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Black Forest Cake",
    price: 150000,
    description: "Bánh rừng đen Đức truyền thống sang trọng với sô cô la đen, cherries tươi ngon, kem tươi xốp mịn. Trang trí chocolate shavings tinh tế, mỗi lớp bánh đều kể câu chuyện hương vị độc đáo về truyền thống nước Đức.",
    category_id: 7,
    image: "https://i.pinimg.com/736x/2a/ed/db/2aeddb3628e19bc72fd4c076aa7bf38e.jpg",
    ingredients: "Dark chocolate, cherries, cream, flour, sugar, eggs, cherry liqueur",
    nutrition: [
      { name: "Calories", value: "330", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "16", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "42", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Mango Cake",
    price: 150000,
    description: "Bánh xoài tây thơm ngon với hương xoài tự nhiên đậm đà, kem sinh đôi mịn mà, lớp bánh xốp nhẹ. Kết hợp màu vàng ươm của xoài tươi và kem trắng tinh khiết, tạo ra sự hấp dẫn về mắt và vị giác.",
    category_id: 7,
    image: "https://i.pinimg.com/736x/b6/ec/f9/b6ecf9bfa5e47660502037540ca3767b.jpg",
    ingredients: "Flour, butter, sugar, eggs, fresh mango, cream, vanilla",
    nutrition: [
      { name: "Calories", value: "270", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "11", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "38", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Caramel Coffee Cake",
    price: 150000,
    description: "Bánh cà phê caramen sang trọng với hương cà phê đắng hấp dẫn, sốt caramen nước đường vàng óng ánh. Lớp kem tươi phủ ngoài, từng miếng mang đầy vị cà phê đậm đà, caramen ngọt nước tạo cảm giác hãm mãi trong miệng.",
    category_id: 7,
    image: "https://i.pinimg.com/1200x/1a/9a/f2/1a9af2ed459f1a23b245dfb198fb5316.jpg",
    ingredients: "Flour, coffee, butter, sugar, eggs, caramel sauce, cream",
    nutrition: [
      { name: "Calories", value: "310", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "14", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "41", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Vanilla Cupcake",
    price: 100000,
    description: "Cupcake vani nhỏ xinh với vị vanilla thơm tinh tế, kem tươi mịn xốp phủ trên cao. Thiết kế đáng yêu, hoàn hảo để làm quà tặng hoặc thưởng thức một mình, mỗi chiếc cupcake đều mang đầy tình yêu thương.",
    category_id: 10,
    image: "https://i.pinimg.com/1200x/95/0a/0a/950a0a62dcebd0b0d9721751c7367d0e.jpg",
    ingredients: "Flour, butter, sugar, eggs, vanilla extract, baking powder",
    nutrition: [
      { name: "Calories", value: "240", unit: "kcal", per: "100g" },
      { name: "Protein", value: "3", unit: "g", per: "100g" },
      { name: "Fat", value: "11", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "32", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Redvelvet Cupcake",
    price: 100000,
    description: "Cupcake red velvet đỏ quyến rũ với lớp frosting cream cheese béo ngậy, vị cacao nhẹ nhàng xen lẫn chua chua tươi mới. Thiết kế nhỏ nhắn, hoàn hảo để thưởng thức từng cắn, mang đầy vị lãng mạn và quý phái.",
    category_id: 10,
    image: "https://i.pinimg.com/1200x/e1/15/0c/e1150c30a34305fb2a94ff5b929d7c79.jpg",
    ingredients: "Flour, butter, sugar, eggs, red food coloring, cream cheese frosting",
    nutrition: [
      { name: "Calories", value: "250", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "12", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "33", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Chocolate Cupcake",
    price: 100000,
    description: "Cupcake sô cô la thơm lừng với vị chocolate đậm đà, kem socola phủ trên lượm cao bóng loáng. Cấu trúc bánh mềm ẩm, hoàn hảo cho những tín đồ socola, mỗi miếng đều mang đầy hương chocolate ngon lành.",
    category_id: 10,
    image: "https://i.pinimg.com/736x/e2/42/90/e24290d6b93ca613ab4ea6b28ce559b0.jpg",
    ingredients: "Flour, chocolate, butter, sugar, eggs, cocoa powder",
    nutrition: [
      { name: "Calories", value: "260", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "13", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "34", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Matcha Cupcake",
    price: 100000,
    description: "Cupcake trà xanh Nhật Bản mới lạ với hương matcha thanh mát, kem trắng tinh tế, chút white chocolate sang trọng. Vị đắng nhẹ của trà xanh cân bằng hoàn hảo với ngọt tế nhị của kem, tạo nên sự kỳ lạ hấp dẫn.",
    category_id: 10,
    image: "https://i.pinimg.com/736x/02/35/9d/02359d2ac4ca610ab26caee0f0d01ef9.jpg",
    ingredients: "Matcha powder, flour, butter, sugar, eggs, white chocolate",
    nutrition: [
      { name: "Calories", value: "240", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "11", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "32", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Lemon Cupcake",
    price: 100000,
    description: "Cupcake chanh tươi sáng mắt với vị chanh thanh mát, kem sinh đôi xốp nhẹ phủ trên. Hương chanh tự nhiên không bị chát, vị chua ngọt cân bằng tuyệt vời, hoàn hảo để làm mát người trong ngày hè nóng nực.",
    category_id: 10,
    image: "https://i.pinimg.com/1200x/1f/d0/f5/1fd0f507a4c02f9193caec4e3aeccd21.jpg",
    ingredients: "Flour, butter, sugar, eggs, fresh lemon juice, lemon zest",
    nutrition: [
      { name: "Calories", value: "230", unit: "kcal", per: "100g" },
      { name: "Protein", value: "3", unit: "g", per: "100g" },
      { name: "Fat", value: "10", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "31", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Strawberry Cream Cupcake",
    price: 100000,
    description: "Cupcake dâu kem tươi mát với dâu tây đỏ mọng nước, kem tươi xốp trắng tinh khiết. Vị dâu tây tự nhiên thanh mát kết hợp kem mềm ẩm tạo nên cảm giác tươi sáng, hoàn hảo cho những ngày hè.",
    category_id: 10,
    image: "https://i.pinimg.com/1200x/fe/a0/ea/fea0ea5f8241a360201dcbfed9699f75.jpg",
    ingredients: "Flour, butter, sugar, eggs, fresh strawberries, whipped cream",
    nutrition: [
      { name: "Calories", value: "250", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "11", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "34", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Mango Mousse",
    price: 100000,
    description: "Mousse xoài thanh mát nhẹ nhàng với hương xoài tây đậm đà, cấu trúc airy mềm mịn tan chảy trên lưỡi. Vị xoài tự nhiên không bị ngọt quá, kết hợp chua tươi tạo nên sự sống động, lý tưởng cho những buổi chiều nóng.",
    category_id: 6,
    image: "https://i.pinimg.com/736x/69/e0/a0/69e0a034d9d37e9be4b565e108001f15.jpg",
    ingredients: "Fresh mango, cream, gelatin, sugar, lemon juice",
    nutrition: [
      { name: "Calories", value: "180", unit: "kcal", per: "100g" },
      { name: "Protein", value: "3", unit: "g", per: "100g" },
      { name: "Fat", value: "8", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "24", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Passion Fruit Mousse",
    price: 100000,
    description: "Mousse chanh leo tây ngon lạ miệng với vị chua ngọt đặc trưng, cấu trúc mousse mềm xốp, vị ở trong hơi hính tươi mát. Màu vàng óng ánh, hương lan tỏa, hoàn hảo cho những tín đồ vị chua ngọt độc đáo.",
    category_id: 6,
    image: "https://i.pinimg.com/1200x/2a/1b/73/2a1b7310bdfb1dc4cda999c3ce7a47c4.jpg",
    ingredients: "Passion fruit pulp, cream, gelatin, sugar, vanilla",
    nutrition: [
      { name: "Calories", value: "190", unit: "kcal", per: "100g" },
      { name: "Protein", value: "3", unit: "g", per: "100g" },
      { name: "Fat", value: "9", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "25", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Matcha Mousse",
    price: 100000,
    description: "Mousse trà xanh Nhật Bản thơm lừng với hương matcha tinh tế, cấu trúc nhẹ xốp mềm mịn, chút white chocolate tạo vị ngọt tế nhị. Vị đắng thanh mát của trà xanh cân bằng tuyệt vời, mang đầy uy lực của văn hóa trà đạo.",
    category_id: 6,
    image: "https://i.pinimg.com/736x/d9/69/46/d96946685466a74796463ac2860c30aa.jpg",
    ingredients: "Matcha powder, cream, gelatin, sugar, white chocolate",
    nutrition: [
      { name: "Calories", value: "200", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "10", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "24", unit: "g", per: "100g" }
    ]
  },
  {
    name: "New York Cheesecake",
    price: 120000,
    description: "Bánh phô mai New York truyền thống sang trọng với lớp cream cheese mềm mại béo ngậy, đáy bánh quy bơ giòn, kem chua cân bằng hoàn hảo. Vị cheese đặc trưng, không quá ngọt, mang đậm chuỗi truyền thống từ xứ sở tự do.",
    category_id: 6,
    image: "https://i.pinimg.com/1200x/8f/e0/ce/8fe0ce8882a37c1be6c76f176bdaff51.jpg",
    ingredients: "Cream cheese, graham cracker crust, sugar, eggs, sour cream",
    nutrition: [
      { name: "Calories", value: "320", unit: "kcal", per: "100g" },
      { name: "Protein", value: "7", unit: "g", per: "100g" },
      { name: "Fat", value: "19", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "32", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Oreo Cheesecake",
    price: 120000,
    description: "Bánh phô mai Oreo lạ miệng với những mảnh bánh Oreo ngon lành, cream cheese mềm béo, đáy bánh quy Oreo giòn. Kết hợp vị bánh quy socola ngọt, vị cheese béo mịn tạo nên sự hài hòa tuyệt vời cho những tín đồ Oreo.",
    category_id: 6,
    image: "https://i.pinimg.com/1200x/ea/b8/1b/eab81b8cf368b1c45e5adbd72410a866.jpg",
    ingredients: "Cream cheese, Oreo cookies, graham cracker crust, sugar, eggs",
    nutrition: [
      { name: "Calories", value: "340", unit: "kcal", per: "100g" },
      { name: "Protein", value: "7", unit: "g", per: "100g" },
      { name: "Fat", value: "20", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "35", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Pineapple Cake",
    price: 150000,
    description: "Bánh dứa vàng ươm với hương dứa tươi mát tự nhiên, kem sinh đôi mịn mà, lớp bánh xốp nhẹ. Vị dứa chua ngọt vừa phải, kết hợp kem béo tạo cảm giác tươi sáng, hoàn hảo để thưởng thức trong những ngày nóng.",
    category_id: 7,
    image: "https://i.pinimg.com/736x/cf/a4/ad/cfa4addbcff726ea310d47102dc93464.jpg",
    ingredients: "Flour, butter, sugar, eggs, fresh pineapple, cream",
    nutrition: [
      { name: "Calories", value: "280", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "12", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "38", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Coconut Cake",
    price: 150000,
    description: "Bánh dừa thơm mát với hương dừa thanh lịch, kem dừa xốp nhẹ tươi mát, lớp bánh thấm dừa. Vị dừa thoang thoảng không bị cấy cổ, kết hợp kem béo tạo nên sự hấp dẫn, lý tưởng cho những ai yêu hương dừa.",
    category_id: 7,
    image: "https://i.pinimg.com/1200x/8c/5b/59/8c5b59cd3649282b56c294bd7ba61bd5.jpg",
    ingredients: "Flour, butter, sugar, eggs, shredded coconut, coconut milk",
    nutrition: [
      { name: "Calories", value: "300", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "14", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "39", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Carrot Cake",
    price: 150000,
    description: "Bánh cà rốt bổ dưỡng với hương vị tự nhiên, frosting cream cheese béo ngậy, bánh xốp ẩm lâu. Cà rốt mịn trong bánh, pha trộn với gia vị thanh lịch, mang đầy năng lượng sức sống cho ngày mới.",
    category_id: 7,
    image: "https://i.pinimg.com/736x/e1/1a/01/e11a01ff63456ec0706a7575254a9370.jpg",
    ingredients: "Flour, carrots, butter, sugar, eggs, cream cheese frosting",
    nutrition: [
      { name: "Calories", value: "290", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "13", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "38", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Opera Cake",
    price: 100000,
    description: "Bánh Opera sang trọng kiểu Pháp với lớp chocolate đen bóng loáng, cà phê đắng hấp dẫn, ganache mịn mà, bánh xốp nhẹ. Từng lớp bánh kỳ công, mang đầy uy lực của ẩm thực Pháp cao cấp, tuyệt hảo cho những dịp lễ.",
    category_id: 7,
    image: "https://i.pinimg.com/736x/19/ed/cb/19edcbbfff6a9d6f6c790727260853a7.jpg",
    ingredients: "Chocolate, coffee, butter, eggs, ganache, chocolate glaze",
    nutrition: [
      { name: "Calories", value: "350", unit: "kcal", per: "100g" },
      { name: "Protein", value: "6", unit: "g", per: "100g" },
      { name: "Fat", value: "21", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "36", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Mille Crepe Cake",
    price: 150000,
    description: "Bánh mille crepe tinh tế với hàng ngàn lớp crepe mỏng manh chỉ như tờ giấy, kem pastry mịn mà xen giữa. Cấu trúc nên những lớp bánh từng lớp, từng layer được coi trọng, mang đầy công phu kỹ thuật cao của đầu bếp.",
    category_id: 7,
    image: "https://i.pinimg.com/736x/22/4d/f3/224df36b0dc4677bf3ce1ebabcf3557e.jpg",
    ingredients: "Crepes, pastry cream, butter, sugar, vanilla",
    nutrition: [
      { name: "Calories", value: "310", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "14", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "40", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Burnt Basque Cheesecake",
    price: 149999,
    description: "Bánh phô mai Basque độc đáo với phần mặt trên đốt cháy hơi, đáy bơ béo ngậy lạnh mát, nội tâm cream cheese mềm như sương. Sự tương phản tuyệt vời giữa lớp cốc ngoài và phần mềm trong, mang đầy bất ngờ hấp dẫn.",
    category_id: 6,
    image: "https://i.pinimg.com/736x/7c/a0/2c/7ca02c53cafadfbe569d6ef803b82615.jpg",
    ingredients: "Cream cheese, sugar, eggs, heavy cream, high heat",
    nutrition: [
      { name: "Calories", value: "380", unit: "kcal", per: "100g" },
      { name: "Protein", value: "8", unit: "g", per: "100g" },
      { name: "Fat", value: "28", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "28", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Strawberry Mousse",
    price: 150000,
    description: "Mousse dâu tây mềm mại với hương dâu tây tươi sáng, cấu trúc airy nhẹ xốp, dâu tây tươi bên trong. Vị dâu tây tự nhiên thanh mát, kết hợp kem béo tạo nên sự mềm mịn tan chảy, hoàn hảo cho những ai yêu vị ngọt tự nhiên.",
    category_id: 6,
    image: "https://i.pinimg.com/736x/5e/64/7f/5e647fa0e3735a09aaf11d2288389057.jpg",
    ingredients: "Fresh strawberries, cream, gelatin, sugar, lemon juice",
    nutrition: [
      { name: "Calories", value: "190", unit: "kcal", per: "100g" },
      { name: "Protein", value: "3", unit: "g", per: "100g" },
      { name: "Fat", value: "9", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "24", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Croissant",
    price: 70000,
    description: "Bánh sừng bơ giòn với lớp ngoài vàng ươm, lớp trong mỏng manh bằng lớp tờ báo. Khi cắn vào tạo âm thanh crunch đặc trưng, vị bơ tây thanh lịch, bánh mềm mịn bên trong, hoàn hảo với cà phê sáng.",
    category_id: 9,
    image: "https://i.pinimg.com/736x/9a/69/c3/9a69c3409690f1a9a10578a48d84ac6c.jpg",
    ingredients: "Flour, butter, salt, sugar, yeast, milk",
    nutrition: [
      { name: "Calories", value: "410", unit: "kcal", per: "100g" },
      { name: "Protein", value: "8", unit: "g", per: "100g" },
      { name: "Fat", value: "22", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "46", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Chocolate Croissant (Pain au Chocolat)",
    price: 100000,
    description: "Bánh sừng socola với lớp ngoài giòn vàng ơm, bên trong hai thanh socola đen chảy nhẹ, lớp bánh xốp mềm. Vị socola đắng ngon lành kết hợp bơ tây thanh thoát, hoàn hảo để bắt đầu một ngày năng động.",
    category_id: 9,
    image: "https://i.pinimg.com/736x/eb/29/53/eb2953963acb5b650a7f0f51461ec71b.jpg",
    ingredients: "Flour, butter, chocolate bars, salt, sugar, yeast",
    nutrition: [
      { name: "Calories", value: "450", unit: "kcal", per: "100g" },
      { name: "Protein", value: "8", unit: "g", per: "100g" },
      { name: "Fat", value: "24", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "50", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Almond Croissant",
    price: 100000,
    description: "Bánh sừng hạnh nhân sang trọng với lớp almond slices vàng ơm, nhân hạnh nhân kem mịn, bánh xốp nhẹ. Hương hạnh nhân thoang thoảng, vị bơ tây tinh tế, lớp almond ngoài giòn rụm, hoàn hảo cho những đặc biệt.",
    category_id: 9,
    image: "https://i.pinimg.com/1200x/76/2d/c6/762dc60093a0d5984ed94156e6cdde3f.jpg",
    ingredients: "Flour, butter, sliced almonds, almond paste, sugar",
    nutrition: [
      { name: "Calories", value: "480", unit: "kcal", per: "100g" },
      { name: "Protein", value: "10", unit: "g", per: "100g" },
      { name: "Fat", value: "28", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "48", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Danish Pastry",
    price: 100000,
    description: "Bánh ngọt Đan Mạch thanh lịch với lớp ngoài giòn, nhân kem hoặc mứt chua ngọt bên trong, bánh xốp mềm. Lớp đường nhân tạo bóng loáng trên mặt, kết hợp hương bơ tây, hoàn hảo để thưởng thức buổi trà chiều.",
    category_id: 9,
    image: "https://i.pinimg.com/1200x/b0/ee/e1/b0eee1f2e2dca34f5b46f817e02d01d3.jpg",
    ingredients: "Flour, butter, yeast, sugar, eggs, jam or cream filling",
    nutrition: [
      { name: "Calories", value: "380", unit: "kcal", per: "100g" },
      { name: "Protein", value: "7", unit: "g", per: "100g" },
      { name: "Fat", value: "18", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "48", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Apple Turnover",
    price: 75000,
    description: "Bánh cuộn táo lạnh giòn với nhân táo tươi chua ngọt, gia vị cinnamon thơm phức, lớp ngoài puff pastry giòn rụm. Vị táo tự nhiên không quá ngọt, kết hợp gia vị cinnamon tạo nên sự ấm áp, hoàn hảo cho mùa lạnh.",
    category_id: 9,
    image: "https://i.pinimg.com/1200x/c3/8b/ea/c38bea0bbefe3028d9a25ee4b9b030c7.jpg",
    ingredients: "Puff pastry, fresh apples, sugar, cinnamon, butter",
    nutrition: [
      { name: "Calories", value: "320", unit: "kcal", per: "100g" },
      { name: "Protein", value: "4", unit: "g", per: "100g" },
      { name: "Fat", value: "14", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "42", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Cinnamon Roll",
    price: 100000,
    description: "Bánh cuộn quế thơm nức mũi với hương quế nồng nàn ấm áp, frosting cream cheese béo ngậy phủ trên. Bánh xốp ẩm lâu, từng lớp xoắn tinh tế, hương quế và cream cheese tạo nên sự hấp dẫn, hoàn hảo cho buổi sáng.",
    category_id: 9,
    image: "https://i.pinimg.com/736x/f6/3b/ce/f63bce43d1244c7ee96133a0897f4569.jpg",
    ingredients: "Flour, butter, sugar, eggs, cinnamon, cream cheese frosting",
    nutrition: [
      { name: "Calories", value: "380", unit: "kcal", per: "100g" },
      { name: "Protein", value: "7", unit: "g", per: "100g" },
      { name: "Fat", value: "16", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "50", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Palmier",
    price: 70000,
    description: "Bánh lá vàng giòn với hình cánh bướm xinh xắn, lớp ngoài phủ đường cinnamon bóng loáng, bên trong puff pastry giòn rụm. Vị lạ kỳ với sự giòn tan tan của bánh, thích hợp làm quà tặng hoặc thưởng thức riêng.",
    category_id: 9,
    image: "https://i.pinimg.com/1200x/69/33/19/69331986b70d02a50b18037eebfdd741.jpg",
    ingredients: "Puff pastry, sugar, butter",
    nutrition: [
      { name: "Calories", value: "420", unit: "kcal", per: "100g" },
      { name: "Protein", value: "6", unit: "g", per: "100g" },
      { name: "Fat", value: "24", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "44", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Choux Craquelin",
    price: 100000,
    description: "Bánh su xốp giòn với lớp craquelin bên ngoài tạo âm thanh crunch độc đáo, nhân kem pastry mịn mà bên trong. Hương vanilla tinh tế, cấu trúc bánh xốp nhẹ, lớp craquelin bóng loáng, hoàn hảo cho những dịp lễ.",
    category_id: 9,
    image: "https://i.pinimg.com/1200x/c5/1c/3a/c51c3a6c0178c3d4e29e044249e11f9d.jpg",
    ingredients: "Choux dough, craquelin topping, pastry cream, sugar",
    nutrition: [
      { name: "Calories", value: "360", unit: "kcal", per: "100g" },
      { name: "Protein", value: "7", unit: "g", per: "100g" },
      { name: "Fat", value: "18", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "42", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Éclair",
    price: 80000,
    description: "Bánh choux dài thanh lịch với lớp chocolate glaze bóng loáng sang trọng, nhân kem pastry mịn mà bên trong. Hương chocolate và vanilla hòa quyện, cấu trúc bánh xốp nhẹ, hoàn hảo cho những người yêu ẩm thực Pháp.",
    category_id: 9,
    image: "https://i.pinimg.com/736x/1f/6d/a7/1f6da79237e496ab1c84ab8010d5389c.jpg",
    ingredients: "Choux dough, pastry cream, chocolate glaze",
    nutrition: [
      { name: "Calories", value: "340", unit: "kcal", per: "100g" },
      { name: "Protein", value: "6", unit: "g", per: "100g" },
      { name: "Fat", value: "16", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "42", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Paris-Brest",
    price: 120000,
    description: "Bánh choux tròn sang trọng Paris-Brest với nhân kem praline giàu vị, lớp almond slices giòn bên ngoài, bánh xốp nhẹ. Kết hợp hương praline thơm, almond giòn, kem béo tạo nên sự hài hòa tuyệt vời, lý tưởng cho lễ diễn.",
    category_id: 9,
    image: "https://i.pinimg.com/1200x/88/b1/84/88b184635d827286f4fee79ec3822c7b.jpg",
    ingredients: "Choux dough, praline cream, sliced almonds",
    nutrition: [
      { name: "Calories", value: "420", unit: "kcal", per: "100g" },
      { name: "Protein", value: "9", unit: "g", per: "100g" },
      { name: "Fat", value: "26", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "40", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Mille-feuille",
    price: 150000,
    description: "Bánh ngàn lớp tinh tế với puff pastry layer mỏng manh xen kẽ kem pastry mịn, phủ fondant icing bóng loáng. Từng lớp bánh được xây dựng tỉ mỉ, kỹ thuật cao, hoàn hảo cho những đặc biệt, mang đầy uy lực ẩm thực Pháp.",
    category_id: 9,
    image: "https://i.pinimg.com/736x/d2/82/37/d282375f7dc564b89c31abbacfba6850.jpg",
    ingredients: "Puff pastry layers, pastry cream, fondant icing",
    nutrition: [
      { name: "Calories", value: "380", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "18", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "48", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Custard Tart",
    price: 300000,
    description: "Bánh trứng kem custard sang trọng với vỏ pie crust giòn, nhân custard mịn mà thơm vanilla, bảng custard vàng óng ánh. Vị egg tart truyền thống, bánh giòn ngoài mềm trong, hoàn hảo cho những ai yêu ẩm thực Á Đông truyền thống.",
    category_id: 9,
    image: "https://i.pinimg.com/736x/71/26/a2/7126a2fcc86b5cb406690d4f5e3d8910.jpg",
    ingredients: "Pie crust, custard filling, eggs, milk, sugar",
    nutrition: [
      { name: "Calories", value: "280", unit: "kcal", per: "100g" },
      { name: "Protein", value: "6", unit: "g", per: "100g" },
      { name: "Fat", value: "12", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "38", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Egg Tart",
    price: 80000,
    description: "Bánh trứng nhỏ xinh theo phong cách Hong Kong với vỏ puff pastry giòn, nhân custard mềm mại, vị egg tart đặc trưng chua ngọt. Lý tưởng để thưởng thức khi còn nóng, hoàn hảo cho buổi chè chiều hoặc quà tặng nhỏ.",
    category_id: 9,
    image: "https://i.pinimg.com/1200x/07/6d/5b/076d5b1945496ab4a242a5c9c8cc7457.jpg",
    ingredients: "Puff pastry, egg custard, condensed milk",
    nutrition: [
      { name: "Calories", value: "240", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "10", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "32", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Chocolate Chip Cookie",
    price: 80000,
    description: "Cookie sô cô la hạt kinh điển với những hạt socola đen chảy, bánh mềm ẩm ngay sau lò, vị bơ vanilla thanh thoát. Hương socola thơm, bánh giòn bên ngoài mềm bên trong, hoàn hảo để thưởng thức với sữa lạnh.",
    category_id: 11,
    image: "https://i.pinimg.com/736x/68/88/39/688839bbf0e7442c03ff1c543d23b608.jpg",
    ingredients: "Flour, butter, sugar, eggs, chocolate chips, vanilla",
    nutrition: [
      { name: "Calories", value: "480", unit: "kcal", per: "100g" },
      { name: "Protein", value: "6", unit: "g", per: "100g" },
      { name: "Fat", value: "24", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "62", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Double Chocolate Cookie",
    price: 85000,
    description: "Cookie đôi socola sang trọng với hạt socola đen chảy xen lẫn white chocolate, bánh mềm xốp. Vị socola đậm đà, kết hợp white chocolate ngọt thanh tạo nên sự tương phản hoàn hảo, hoàn hảo cho những tín đồ socola.",
    category_id: 11,
    image: "https://i.pinimg.com/1200x/cb/cc/db/cbccdb1940d2ed9c954307e750978ee6.jpg",
    ingredients: "Flour, butter, sugar, eggs, dark chocolate, white chocolate",
    nutrition: [
      { name: "Calories", value: "500", unit: "kcal", per: "100g" },
      { name: "Protein", value: "6", unit: "g", per: "100g" },
      { name: "Fat", value: "26", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "62", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Oatmeal Raisin Cookie",
    price: 80000,
    description: "Cookie yến mạch nho khô bổ dưỡng với hạt nho tươi ngon, yến mạch nguyên chất bổ máu, bánh mềm ẩm lâu. Vị nho khô chua ngọt, yến mạch thanh lịch, hoàn hảo cho những ai tìm kiếm bánh ngon nhưng lành mạnh.",
    category_id: 11,
    image: "https://i.pinimg.com/1200x/b3/e5/c5/b3e5c5da18f53728841b202b4ac411c4.jpg",
    ingredients: "Flour, oatmeal, butter, sugar, eggs, raisins",
    nutrition: [
      { name: "Calories", value: "420", unit: "kcal", per: "100g" },
      { name: "Protein", value: "7", unit: "g", per: "100g" },
      { name: "Fat", value: "18", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "58", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Butter Cookie",
    price: 70000,
    description: "Cookie bơ kem thanh lịch với vị bơ nguyên chất tỏa hương, bánh giòn tan ngay trong miệng, vị vanilla thanh thoát. Cấu trúc đơn giản nhưng tinh tế, hoàn hảo cho những ai yêu các loại bánh truyền thống, quà tặng lý tưởng.",
    category_id: 11,
    image: "https://i.pinimg.com/1200x/0d/fe/5b/0dfe5b2cfcec31845f3ba0a1e91caa84.jpg",
    ingredients: "Flour, butter, sugar, eggs, vanilla",
    nutrition: [
      { name: "Calories", value: "460", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "22", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "60", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Matcha Cookie",
    price: 85000,
    description: "Cookie trà xanh Nhật Bản mới lạ với hương matcha tinh tế, white chocolate ngọt thanh, bánh mềm xốp. Vị đắng nhẹ của trà xanh cân bằng hoàn hảo với ngọt tế nhị của white chocolate, mang đầy uy lực ẩm thực Nhật.",
    category_id: 11,
    image: "https://i.pinimg.com/1200x/22/cc/2a/22cc2a22e91496331530519e95a10dfc.jpg",
    ingredients: "Flour, butter, sugar, eggs, matcha powder, white chocolate",
    nutrition: [
      { name: "Calories", value: "470", unit: "kcal", per: "100g" },
      { name: "Protein", value: "6", unit: "g", per: "100g" },
      { name: "Fat", value: "23", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "60", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Almond Cookie",
    price: 75000,
    description: "Cookie hạnh nhân thơm lừng với hạnh nhân xay nhuyễn, hương almond thoang thoảng, bánh giòn tan. Vị hạnh nhân tinh tế, bánh không quá ngọt, hoàn hảo cho những ai yêu hương hạnh nhân, lý tưởng để làm quà tặng.",
    category_id: 11,
    image: "https://i.pinimg.com/1200x/94/6b/75/946b75d5e54e65875b818838617895aa.jpg",
    ingredients: "Flour, butter, sugar, eggs, ground almonds, almond extract",
    nutrition: [
      { name: "Calories", value: "490", unit: "kcal", per: "100g" },
      { name: "Protein", value: "8", unit: "g", per: "100g" },
      { name: "Fat", value: "26", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "58", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Red Velvet Cookie",
    price: 80000,
    description: "Cookie red velvet đỏ quyến rũ với frosting cream cheese béo ngậy, vị cacao nhẹ nhàng chua chua tươi. Màu đỏ sang trọng, bánh mềm xốp, hoàn hảo cho những dịp lễ hoặc quà tặng đặc biệt cho người thân.",
    category_id: 11,
    image: "https://i.pinimg.com/736x/d0/4c/4c/d04c4c8f1a4ca8e120fe21fc8279c662.jpg",
    ingredients: "Flour, butter, sugar, eggs, red food coloring, cream cheese",
    nutrition: [
      { name: "Calories", value: "480", unit: "kcal", per: "100g" },
      { name: "Protein", value: "6", unit: "g", per: "100g" },
      { name: "Fat", value: "24", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "60", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Gingerbread Cookie",
    price: 80000,
    description: "Cookie gừng noel ấm áp với hương gừng mối, gia vị phức hợp cinnamon, bánh mềm ẩm lâu. Màu nâu sẫm, bánh giòn ngoài mềm trong, hoàn hảo cho mùa Noel hoặc những ngày lạnh, quà tặng truyền thống.",
    category_id: 11,
    image: "https://i.pinimg.com/1200x/77/f7/bd/77f7bdfac3cfc0db785998596537a7dd.jpg",
    ingredients: "Flour, butter, sugar, eggs, ginger, molasses, spices",
    nutrition: [
      { name: "Calories", value: "440", unit: "kcal", per: "100g" },
      { name: "Protein", value: "5", unit: "g", per: "100g" },
      { name: "Fat", value: "20", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "60", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Japanese Milk Bread",
    price: 80000,
    description: "Bánh mì Nhật sữa mềm xốp với lớp vỏ vàng ơm, bánh inside xốp mềm ngay cả sau ngày. Vị sữa thanh thoát, bánh không quá ngọt, hoàn hảo để ăn cùng bơ, jam, hoặc thêm nhiều topping khác.",
    category_id: 12,
    image: "https://i.pinimg.com/736x/9d/42/21/9d4221ac6fbc8dd20e6bbe9c19a787c8.jpg",
    ingredients: "Flour, milk, butter, sugar, yeast, salt, eggs",
    nutrition: [
      { name: "Calories", value: "280", unit: "kcal", per: "100g" },
      { name: "Protein", value: "8", unit: "g", per: "100g" },
      { name: "Fat", value: "8", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "46", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Garlic Bread",
    price: 80000,
    description: "Bánh mì tỏi thơm tức mũi với tỏi tươi xắt nhỏ, bơ tan chảy, parsley tươi thơm. Lớp ngoài bánh giòn vàng, bên trong mềm ẩm, vị tỏi thơm nồng nàn, hoàn hảo khi ăn cùng các món ăn kèm hoặc đơn lẻ.",
    category_id: 12,
    image: "https://i.pinimg.com/1200x/ed/9e/b3/ed9eb36cdddf281e44c8441c18d5d07b.jpg",
    ingredients: "Bread, butter, garlic, parsley, salt",
    nutrition: [
      { name: "Calories", value: "320", unit: "kcal", per: "100g" },
      { name: "Protein", value: "7", unit: "g", per: "100g" },
      { name: "Fat", value: "14", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "42", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Sausage Bread",
    price: 90000,
    description: "Bánh mì xúc xích kỳ lạ với xúc xích thơm ngon, phô mai tan chảy, bánh xốp mềm. Vị xúc xích đậm, phô mai béo, kết hợp bánh mềm tạo nên cảm giác no nê, hoàn hảo cho bữa ăn nhẹ hoặc tiệc ngoài trời.",
    category_id: 12,
    image: "https://i.pinimg.com/736x/81/71/05/817105333037f51dbeb522a684b8a481.jpg",
    ingredients: "Bread dough, sausages, cheese, herbs",
    nutrition: [
      { name: "Calories", value: "380", unit: "kcal", per: "100g" },
      { name: "Protein", value: "12", unit: "g", per: "100g" },
      { name: "Fat", value: "18", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "40", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Ham & Cheese Bread",
    price: 120000,
    description: "Bánh mì thịt và phô mai thanh lịch với thịt ham thơm ngon, phô mai trắng beo béo, bánh xốp nhẹ. Kết hợp vị mặn của thịt ham, phô mai béo tạo nên sự cân bằng hoàn hảo, hoàn hảo cho bữa sáng sang trọng.",
    category_id: 12,
    image: "https://i.pinimg.com/1200x/48/5c/89/485c89928c4307849fe3288576c81d76.jpg",
    ingredients: "Bread dough, ham, cheese, butter, herbs",
    nutrition: [
      { name: "Calories", value: "360", unit: "kcal", per: "100g" },
      { name: "Protein", value: "14", unit: "g", per: "100g" },
      { name: "Fat", value: "16", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "38", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Sweet Red Bean Bread",
    price: 85000,
    description: "Bánh mì đậu đỏ ngọt truyền thống với nhân đậu đỏ ngọt vừa phải, bánh xốp ẩm lâu. Vị đậu đỏ tự nhiên không bị cấy cổ, bánh mềm tạo nên sự ấm áp, hoàn hảo cho bữa sáng hoặc thưởng thức riêng.",
    category_id: 12,
    image: "https://i.pinimg.com/1200x/31/6c/f1/316cf1fd199453d8b5e35cd772ff957d.jpg",
    ingredients: "Bread dough, red bean paste, sugar, butter",
    nutrition: [
      { name: "Calories", value: "320", unit: "kcal", per: "100g" },
      { name: "Protein", value: "7", unit: "g", per: "100g" },
      { name: "Fat", value: "8", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "54", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Custard Cream Bread",
    price: 85000,
    description: "Bánh mì kem custard ngọt ngào với nhân kem custard mịn mà, bánh xốp ẩm mềm. Vị custard tự nhiên, bánh không quá cứng, hoàn hảo cho những ai thích bánh nhân kem, quà tặng yêu thích.",
    category_id: 12,
    image: "https://i.pinimg.com/1200x/78/38/9d/78389d28e1e13f440075f00753cb7e2b.jpg",
    ingredients: "Bread dough, custard cream, butter, sugar",
    nutrition: [
      { name: "Calories", value: "340", unit: "kcal", per: "100g" },
      { name: "Protein", value: "7", unit: "g", per: "100g" },
      { name: "Fat", value: "12", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "50", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Chocolate Bread",
    price: 100000,
    description: "Bánh mì socola với những thanh socola đen chảy, bánh xốp mềm nhẹ. Hương socola thơm, vị socola đắng ngon lành kết hợp bánh mềm ẩm, hoàn hảo cho những tín đồ socola, bữa sáng hay lẻ lúc.",
    category_id: 12,
    image: "https://i.pinimg.com/1200x/5a/53/03/5a5303be5ebc666f9528453d2914f458.jpg",
    ingredients: "Bread dough, chocolate chunks, butter, sugar",
    nutrition: [
      { name: "Calories", value: "380", unit: "kcal", per: "100g" },
      { name: "Protein", value: "8", unit: "g", per: "100g" },
      { name: "Fat", value: "14", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "52", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Raisin Bread",
    price: 90000,
    description: "Bánh mì nho khô với hạt nho khô thơm, gia vị cinnamon ấm áp, bánh xốp ẩm lâu. Vị nho khô chua ngọt, cinnamon thoang thoảng, bánh không quá ngọt, hoàn hảo cho bữa sáng hoặc quà tặng.",
    category_id: 12,
    image: "https://i.pinimg.com/1200x/1f/01/1c/1f011ca27bc1e02075e6fe0e7422e0c5.jpg",
    ingredients: "Bread dough, raisins, butter, sugar, cinnamon",
    nutrition: [
      { name: "Calories", value: "340", unit: "kcal", per: "100g" },
      { name: "Protein", value: "8", unit: "g", per: "100g" },
      { name: "Fat", value: "8", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "58", unit: "g", per: "100g" }
    ]
  },
  {
    name: "Whole Wheat Bread",
    price: 120000,
    description: "Bánh mì lúa mì nguyên hạt bổ dưỡng với sức sống của ngũ cốc toàn vẹn, kem sữa tươi béo, bánh xốp ẩm. Vị lúa mì thanh lịch, bánh cứng vừa phải, hoàn hảo cho những ai tìm kiếm bánh ngon nhưng lành mạnh, bổ dưỡng.",
    category_id: 12,
    image: "https://i.pinimg.com/1200x/f3/f7/6d/f3f76d725c1c763482cdae8c6d889642.jpg",
    ingredients: "Whole wheat flour, butter, milk, sugar, salt, yeast",
    nutrition: [
      { name: "Calories", value: "280", unit: "kcal", per: "100g" },
      { name: "Protein", value: "10", unit: "g", per: "100g" },
      { name: "Fat", value: "6", unit: "g", per: "100g" },
      { name: "Carbohydrates", value: "48", unit: "g", per: "100g" }
    ]
  }
];

const createCategories = async () => {
  try {
    const categoryNames = ['Cake', 'Mousse', 'Cheesecake', 'Pastry', 'Cupcake', 'Cookie', 'Bread'];
    for (const name of categoryNames) {
      await db.query('INSERT IGNORE INTO Category (category_id, name) VALUES (?, ?)', 
        [categoryNames.indexOf(name) + 6, name]);
    }
    console.log('✅ Categories created');
  } catch (err) {
    console.error('❌ Category creation error:', err);
    throw err;
  }
};

const truncateTables = async () => {
  try {
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE NutritionFact');
    await db.query('TRUNCATE TABLE Inventory');
    await db.query('TRUNCATE TABLE Product');
    await db.query('TRUNCATE TABLE Category');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ All tables truncated');
  } catch (err) {
    console.error('❌ Truncate error:', err);
    throw err;
  }
};

const seedProducts = async () => {
  try {
    let productCount = 0;
    let nutritionCount = 0;

    for (const product of seedData) {
      // Insert product
      const [productResult] = await db.query(
        'INSERT INTO Product (name, price, description, ingredients, image, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [product.name, product.price, product.description, product.ingredients, product.image, product.category_id]
      );
      productCount++;

      // Insert inventory
      await db.query('INSERT INTO Inventory (product_id, quantity) VALUES (?, ?)', [productResult.insertId, 10]);

      // Insert nutrition facts
      if (product.nutrition && Array.isArray(product.nutrition)) {
        for (let i = 0; i < product.nutrition.length; i++) {
          const nut = product.nutrition[i];
          await db.query(
            'INSERT INTO NutritionFact (product_id, name, value, unit, per, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [productResult.insertId, nut.name, nut.value, nut.unit, nut.per, i]
          );
          nutritionCount++;
        }
      }

      console.log(`✅ Added: ${product.name}`);
    }

    console.log(`\n📊 Seed Summary:`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Nutrition Facts: ${nutritionCount}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

const run = async () => {
  try {
    await truncateTables();
    await createCategories();
    await seedProducts();
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}

module.exports = { run };
