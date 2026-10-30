import {
  CLASSICAL_SOURCES,
  CLASSICAL_TEXT_VERSION,
  ClassicalHexagramData,
  ClassicalLookupResult,
} from './classical-texts.types';

const SOURCE_REF = CLASSICAL_SOURCES[0];

/**
 * Kho dữ liệu văn bản cổ điển Kinh Dịch đã được kiểm chứng chuẩn xác
 * Nguồn: Chu Dịch Thập Dực (Chu Văn Vương, Chu Công, Khổng Tử) & Nguyễn Hiến Lê dịch giải.
 */
export const VERIFIED_CLASSICAL_HEXAGRAMS: Record<number, ClassicalHexagramData> = {
  // Quẻ số 1: Thuần Càn (Càn vi Thiên)
  1: {
    hexagramNumber: 1,
    hexagramName: 'Thuần Càn',
    sinoVietnameseName: 'Càn vi Thiên',
    chineseName: '乾為天',
    source: SOURCE_REF,
    version: CLASSICAL_TEXT_VERSION,
    thuanTu: {
      chinese: '乾：元亨利貞。',
      sinoVietnamese: 'Càn: Nguyên, hanh, lợi, trinh.',
      translation: 'Quẻ Càn: Rất hanh thông, ích lợi, chính bền.',
      modernExplanation:
        'Càn là sức mạnh sáng tạo nguyên thủy của Trời, biểu thị cho người quân tử có đức lớn, làm việc đại sự với sự kiên định, ngay thẳng và không ngừng vươn lên.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    daiTuong: {
      chinese: '天行健，君子以自強不息。',
      sinoVietnamese: 'Thiên hành kiện, quân tử dĩ tự cường bất tức.',
      translation: 'Trời vận hành mạnh mẽ, người quân tử noi theo đó mà tự cường không ngừng nghỉ.',
      modernExplanation:
        'Lời khuyên người quân tử phải luôn nỗ lực trau dồi đạo đức, tri thức và ý chí bền bỉ như sự vận hành không ngừng của vòm trời.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    lines: [
      {
        position: 1,
        lineName: 'Sơ Cửu',
        haoTu: {
          chinese: '潛龍勿用。',
          sinoVietnamese: 'Tiềm long vật dụng.',
          translation: 'Rồng còn ẩn náu dưới vực sâu, chớ nên hành động vội.',
          modernExplanation:
            'Tài năng còn ở buổi đầu hoặc hoàn cảnh chưa thuận lợi, cần ẩn nhẫn tích lũy nội lực, chờ thời cơ thích hợp, không nên nôn nóng manh động.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '潛龍勿用，陽在下也。',
          sinoVietnamese: 'Tiềm long vật dụng, dương tại hạ dã.',
          translation: 'Rồng ẩn chớ dùng, là vì khí dương còn đang ở dưới đáy.',
          modernExplanation: 'Khí thế còn ở bậc thấp, chưa đủ điều kiện phát tiết ra bên ngoài.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
      {
        position: 2,
        lineName: 'Cửu Nhị',
        haoTu: {
          chinese: '見龍在田，利見大人。',
          sinoVietnamese: 'Hiện long tại điền, lợi kiến đại nhân.',
          translation: 'Rồng xuất hiện nơi đồng ruộng, có lợi khi gặp bậc đại nhân.',
          modernExplanation:
            'Tài năng bắt đầu bộc lộ và được xã hội biết đến, rất có lợi khi tìm kiếm quý nhân nâng đỡ hoặc hợp tác cùng bậc hiền tài.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '見龍在田，德施普也。',
          sinoVietnamese: 'Hiện long tại điền, đức thi phổ dã.',
          translation: 'Rồng hiện nơi ruộng đồng, đức tốt bắt đầu ban khắp.',
          modernExplanation: 'Ân đức và tài năng bắt đầu lan tỏa đem lại lợi ích cho cộng đồng.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
      {
        position: 3,
        lineName: 'Cửu Tam',
        haoTu: {
          chinese: '君子終日乾乾，夕惕若厲，無咎。',
          sinoVietnamese: 'Quân tử chung nhật kiền kiền, tịch dịch nhược lệ, vô cữu.',
          translation:
            'Người quân tử suốt ngày hăng hái, đêm tối lo sợ cẩn trọng như gặp nguy hiểm, thì không có lỗi.',
          modernExplanation:
            'Đang ở bước ngoặt tiến thoái, cần hết sức thận trọng, ban ngày cần cù làm việc, ban đêm tự phản tỉnh lo toan thì mới chuyển nguy thành an.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '終日乾乾，反復道也。',
          sinoVietnamese: 'Chung nhật kiền kiền, phản phục đạo dã.',
          translation: 'Suốt ngày hăng hái, là đi lại theo đúng đạo lý.',
          modernExplanation: 'Chăm chỉ nỗ lực theo đúng phép tắc khuôn vàng thước ngọc.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
      {
        position: 4,
        lineName: 'Cửu Tứ',
        haoTu: {
          chinese: '或躍在淵，無咎。',
          sinoVietnamese: 'Hoặc dược tại uyên, vô cữu.',
          translation: 'Hoặc nhảy vọt lên, hoặc nằm trong vực sâu, không có lỗi.',
          modernExplanation:
            'Đứng trước bước nhảy vọt quan trọng, tiến hay thoái đều tùy theo thời thế linh hoạt, không câu nệ, miễn là hợp đạo thì không mắc lỗi.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '或躍在淵，進無咎也。',
          sinoVietnamese: 'Hoặc dược tại uyên, tiến vô cữu dã.',
          translation: 'Hoặc nhảy vọt ở vực, tiến lên thì không lỗi.',
          modernExplanation: 'Thời cơ đã chín muồi cho sự bứt phá vươn lên tầm cao mới.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
      {
        position: 5,
        lineName: 'Cửu Ngũ',
        haoTu: {
          chinese: '飛龍在天，利見大人。',
          sinoVietnamese: 'Phi long tại thiên, lợi kiến đại nhân.',
          translation: 'Rồng bay lượn trên trời cao, có lợi khi gặp bậc đại nhân.',
          modernExplanation:
            'Thời kỳ hoàng kim, đạt đến đỉnh cao công danh sự nghiệp và uy tín, được muôn người ngưỡng vọng và hợp tác cùng các bậc đại trí thức.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '飛龍在天，大人造也。',
          sinoVietnamese: 'Phi long tại thiên, đại nhân tạo dã.',
          translation: 'Rồng bay trên trời, đó là sự nghiệp do bậc đại nhân tạo dựng.',
          modernExplanation: 'Bậc đại tài đắc chí làm nên công tích vẻ vang cho thiên hạ.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
      {
        position: 6,
        lineName: 'Thượng Cửu',
        haoTu: {
          chinese: '亢龍有悔。',
          sinoVietnamese: 'Kháng long hữu hối.',
          translation: 'Rồng bay lên quá cao ắt có điều phải hối tiếc.',
          modernExplanation:
            'Cảnh báo khi đã ở tột đỉnh danh vọng nếu kiêu ngạo, đi quá giới hạn sẽ rơi vào cảnh cô độc, trượt dốc và phải hối hận. Nên biết điểm dừng.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '亢龍有悔，盈不可久也。',
          sinoVietnamese: 'Kháng long hữu hối, doanh bất khả cửu dã.',
          translation: 'Rồng lên quá cao có hối hận, sự tràn đầy thái quá không thể duy trì dài lâu.',
          modernExplanation: 'Vật cực tất phản, trăng tròn rồi lại khuyết, không gì giữ mãi được sự thái quá.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
    ],
    specialLine: {
      chinese: '用九：見群龍無首，吉。',
      sinoVietnamese: 'Dụng cửu: Kiến quần long vô thủ, cát.',
      translation: 'Dùng hào cửu: Thấy đàn rồng mà không có con đầu đàn xưng vương, tốt lành.',
      modernExplanation:
        'Cương mà biết nhu, tài giỏi mà không kiêu ngạo tranh giành ngôi đầu, quần thể hòa hợp bình đẳng cùng tiến bước là điều đại cát tường.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
  },

  // Quẻ số 2: Thuần Khôn (Khôn vi Địa)
  2: {
    hexagramNumber: 2,
    hexagramName: 'Thuần Khôn',
    sinoVietnameseName: 'Khôn vi Địa',
    chineseName: '坤為地',
    source: SOURCE_REF,
    version: CLASSICAL_TEXT_VERSION,
    thuanTu: {
      chinese:
        '坤：元亨，利牝馬之貞。君子有攸往，先迷後得主，利。西南得朋，東北喪朋。安貞吉。',
      sinoVietnamese:
        'Khôn: Nguyên hanh, lợi tẫn mã chi trinh. Quân tử hữu du vãng, tiên mê hậu đắc chủ, lợi. Tây nam đắc bằng, đông bắc táng bằng. An trinh cát.',
      translation:
        'Quẻ Khôn: Rất hanh thông, ích lợi theo sự bền bỉ của ngựa cái. Người quân tử có việc đi: đi trước thì lạc lối mê muội, đi sau thì tìm được chủ mà có lợi. Về Tây Nam thì gặp bạn, về Đông Bắc thì mất bạn. Yên vui, chính bền thì tốt lành.',
      modernExplanation:
        'Đạo Khôn là đức nhu thuận, lấy sự tiếp nhận, hỗ trợ và bao dung làm gốc. Cần biết nhẫn nại, đóng vai trò hậu thuẫn khéo léo hơn là tiên phong tranh quyền.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    daiTuong: {
      chinese: '地勢坤，君子以厚德載物。',
      sinoVietnamese: 'Địa thế khôn, quân tử dĩ hậu đức tải vật.',
      translation:
        'Thế đất rộng dày và nhu thuận là quẻ Khôn, người quân tử noi theo đó lấy đức dày mà chở che nâng đỡ muôn vật.',
      modernExplanation:
        'Khuyên răn con người tu dưỡng lòng bao dung, độ lượng và đức độ sâu dày để có thể bao hàm và giúp đỡ mọi người.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    lines: [
      {
        position: 1,
        lineName: 'Sơ Lục',
        haoTu: {
          chinese: '履霜，堅冰至。',
          sinoVietnamese: 'Lý sương, kiên băng chí.',
          translation: 'Đạp lên sương thu, băng dày ắt sẽ đến.',
          modernExplanation:
            'Thấy điềm nhỏ phải biết trước tai họa lớn sau này. Khuyên răn đề phòng mầm mống bất trắc ngay từ khi mới chớm phát sinh.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '履霜堅冰，陰始凝也。馴致其道，至堅冰也。',
          sinoVietnamese: 'Lý sương kiên băng, âm thủy ngưng dã. Tuần trí kỳ đạo, chí kiên băng dã.',
          translation: 'Đạp sương băng dày, là lúc khí âm bắt đầu ngưng đọng. Cứ theo đạo lý tích tụ thì băng dày ắt đến.',
          modernExplanation: 'Mọi sự việc đều tích tụ dần dần từ nhỏ đến lớn.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
      {
        position: 2,
        lineName: 'Lục Nhị',
        haoTu: {
          chinese: '直方大，不習無不利。',
          sinoVietnamese: 'Trực phương đại, bất tập vô bất lợi.',
          translation: 'Thẳng thắn, vuông vắn, rộng lớn; không cần học tập rèn luyện mà chẳng có gì không lợi.',
          modernExplanation:
            'Bản tính ngay thẳng, phép tắc mẫu mực và tâm hồn bao la, thuận theo tự nhiên thì mọi việc đều tốt đẹp mà không cần mưu mô xảo quyệt.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '六二之動，直以方也。不習無不利，地道光也。',
          sinoVietnamese: 'Lục nhị chi động, trực dĩ phương dã. Bất tập vô bất lợi, địa đạo quang dã.',
          translation: 'Sự vận động của hào Lục Nhị thẳng thắn và vuông vức. Không cần tập luyện mà chẳng gì không lợi, đó là đạo đất sáng ngời.',
          modernExplanation: 'Phẩm chất trong sáng trung chính của Đạo đất tự nhiên mang lại điềm lành.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
      {
        position: 3,
        lineName: 'Lục Tam',
        haoTu: {
          chinese: '含章可貞。或從王事，無成有終。',
          sinoVietnamese: 'Hàm chương khả trinh. Hoặc tòng vương sự, vô thành hữu chung.',
          translation: 'Ngậm giấu tài đức mà giữ chính bền. Hoặc gánh vác việc vua, không dám tranh công đầu nhưng kết cục trọn vẹn.',
          modernExplanation:
            'Tài năng không cần khoe khoang, làm việc hết lòng nhưng khiêm tốn nhường công lao cho tập thể thì có kết quả hậu vận tốt.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '含章可貞，以時發也。或從王事，知光大也。',
          sinoVietnamese: 'Hàm chương khả trinh, dĩ thời phát dã. Hoặc tòng vương sự, tri quang đại dã.',
          translation: 'Giấu đức giữ chính, đợi thời cơ phát lộ. Hoặc theo việc vua, tài trí rạng rỡ rộng lớn.',
          modernExplanation: 'Biết chờ đúng thời cơ mới thể hiện thực tài.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
      {
        position: 4,
        lineName: 'Lục Tứ',
        haoTu: {
          chinese: '括囊，無咎無譽。',
          sinoVietnamese: 'Quát nang, vô cữu vô dự.',
          translation: 'Buộc kín miệng túi, không có lỗi lầm cũng không có danh dự khen ngợi.',
          modernExplanation:
            'Trong hoàn cảnh nhạy cảm phức tạp, cần kín đáo giữ miệng, thận trọng kín kẽ như túi buộc chặt, không cầu danh tiếng để cầu sự bình an vô sự.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '括囊無咎，慎不害也。',
          sinoVietnamese: 'Quát nang vô cữu, thận bất hại dã.',
          translation: 'Buộc kín miệng túi không lỗi, cẩn thận thì không bị tai hại.',
          modernExplanation: 'Cẩn tắc vô áy náy, tránh được họa hại thị phi.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
      {
        position: 5,
        lineName: 'Lục Ngũ',
        haoTu: {
          chinese: '黃裳，元吉。',
          sinoVietnamese: 'Hoàng thường, nguyên cát.',
          translation: 'Cái xiêm áo màu vàng, rất tốt lành lớn.',
          modernExplanation:
            'Màu vàng biểu trưng cho trung đạo của đất trời. Đạt địa vị cao quý mà giữ lòng khiêm nhường ở vị thế dưới (xiêm áo), đại cát đại lợi.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '黃裳元吉，文在中也。',
          sinoVietnamese: 'Hoàng thường nguyên cát, văn tại trung dã.',
          translation: 'Xiêm vàng rất tốt lành, vẻ đẹp văn chất kín đáo ở bên trong.',
          modernExplanation: 'Đức độ sáng ngời từ nội tâm không cần phô trương bên ngoài.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
      {
        position: 6,
        lineName: 'Thượng Lục',
        haoTu: {
          chinese: '龍戰于野，其血玄黃。',
          sinoVietnamese: 'Long chiến vu dã, kỳ huyết huyền hoàng.',
          translation: 'Rồng đánh nhau nơi đồng hoang, máu chảy màu đen vàng.',
          modernExplanation:
            'Âm khí phát triển đến cùng cực tranh giành với dương khí, dẫn đến xung đột dữ dội, cả hai bên đều chịu thương tổn máu chảy. Cần tránh đối đầu cực đoan.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        tieuTuong: {
          chinese: '龍戰于野，其道窮也。',
          sinoVietnamese: 'Long chiến vu dã, kỳ đạo cùng dã.',
          translation: 'Rồng đánh nhau nơi đồng hoang, đạo ấy đã cùng đường cực điểm.',
          modernExplanation: 'Con đường cố chấp đi đến chỗ cùng cực tất phải sinh tranh chấp đổ máu.',
          source: SOURCE_REF,
          version: CLASSICAL_TEXT_VERSION,
        },
        source: SOURCE_REF,
        version: CLASSICAL_TEXT_VERSION,
      },
    ],
    specialLine: {
      chinese: '用六：利永貞。',
      sinoVietnamese: 'Dụng lục: Lợi vĩnh trinh.',
      translation: 'Dùng hào sáu: Có lợi về việc giữ vững chính bền lâu dài.',
      modernExplanation:
        'Biết nhu thuận mềm dẻo nhưng phải luôn gắn liền với sự kiên định, son sắt theo chính đạo thì mới duy trì được phúc lành trường cửu.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
  },

  // Quẻ số 11: Địa Thiên Thái
  11: {
    hexagramNumber: 11,
    hexagramName: 'Địa Thiên Thái',
    sinoVietnameseName: 'Địa Thiên Thái',
    chineseName: '地天泰',
    source: SOURCE_REF,
    version: CLASSICAL_TEXT_VERSION,
    thuanTu: {
      chinese: '泰：小往大來，吉亨。',
      sinoVietnamese: 'Thái: Tiểu vãng đại lai, cát hanh.',
      translation: 'Quẻ Thái: Cái nhỏ (âm) đi, cái lớn (dương) đến, tốt lành hanh thông.',
      modernExplanation:
        'Thời vận hanh thông, trời đất giao hòa, âm dương thông suốt. Kẻ tiểu nhân lùi bước, người quân tử tiến lên, thời cơ thịnh vượng phát triển.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    daiTuong: {
      chinese: '天地交，泰。后以財成天地之道，輔相天地之宜，以左右民。',
      sinoVietnamese: 'Thiên địa giao, Thái. Hậu dĩ tài thành thiên địa chi đạo, phụ tương thiên địa chi nghi, dĩ tả hữu dân.',
      translation:
        'Trời đất giao hòa là quẻ Thái. Bậc vương giả noi theo đó định liệu đạo trời đất, phò trợ sự thích nghi của muôn vật để giúp đỡ dân lành.',
      modernExplanation: 'Người lãnh đạo thuận theo quy luật tự nhiên, điều hòa các mối quan hệ xã hội để muôn dân an cư lạc nghiệp.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    lines: [],
  },

  // Quẻ số 12: Thiên Địa Bĩ
  12: {
    hexagramNumber: 12,
    hexagramName: 'Thiên Địa Bĩ',
    sinoVietnameseName: 'Thiên Địa Bĩ',
    chineseName: '天地否',
    source: SOURCE_REF,
    version: CLASSICAL_TEXT_VERSION,
    thuanTu: {
      chinese: '否：否之匪人，不利君子貞，大往小來。',
      sinoVietnamese: 'Bĩ: Bĩ chi phỉ nhân, bất lợi quân tử trinh, đại vãng tiểu lai.',
      translation: 'Quẻ Bĩ: Bế tắc chẳng phải đạo người, không lợi cho sự chính bền của người quân tử, cái lớn đi cái nhỏ đến.',
      modernExplanation:
        'Thời vận bế tắc, âm dương không giao thông, tiểu nhân đắc thế, quân tử thoái ẩn. Nên giữ mình tiết kiệm đạo đức, không nên manh động mưu cầu bổng lộc.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    daiTuong: {
      chinese: '天地不交，否。君子以儉德辟難，不可榮以祿。',
      sinoVietnamese: 'Thiên địa bất giao, Bĩ. Quân tử dĩ kiệm đức tịch nạn, bất khả vinh dĩ lộc.',
      translation: 'Trời đất không giao hòa là quẻ Bĩ. Người quân tử lấy đức tiết kiệm mà lánh nạn, không thể cầu vinh hiển bằng bổng lộc.',
      modernExplanation: 'Gặp thời suy loạn cần ẩn nhẫn bảo toàn khí tiết, chớ ham danh lợi mà rước họa vào thân.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    lines: [],
  },

  // Quẻ số 44: Thiên Phong Cấu
  44: {
    hexagramNumber: 44,
    hexagramName: 'Thiên Phong Cấu',
    sinoVietnameseName: 'Thiên Phong Cấu',
    chineseName: '天風姤',
    source: SOURCE_REF,
    version: CLASSICAL_TEXT_VERSION,
    thuanTu: {
      chinese: '姤：女壯，勿用取女。',
      sinoVietnamese: 'Cấu: Nữ tráng, vật dụng thủ nữ.',
      translation: 'Quẻ Cấu: Người nữ mạnh mẽ bạo phát, chớ nên lấy người nữ ấy.',
      modernExplanation:
        'Cấu là sự tao ngộ bất ngờ, một hào âm mới sinh dưới năm hào dương. Nhắc nhở cẩn trọng trước sự cám dỗ hoặc những nhân tố tiêu cực mới nảy sinh trong hoàn cảnh.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    daiTuong: {
      chinese: '天下有風，姤。后以施命誥四方。',
      sinoVietnamese: 'Thiên hạ hữu phong, Cấu. Hậu dĩ thi mệnh cáo tứ phương.',
      translation: 'Dưới trời có gió thổi là quẻ Cấu. Bậc vua chúa dựa vào đó ban bố mệnh lệnh truyền khắp bốn phương.',
      modernExplanation: 'Như gió thổi truyền khắp dưới vòm trời, người lãnh đạo phổ biến mệnh lệnh, quy chế sâu rộng để chỉnh đốn kỷ cương.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    lines: [],
  },

  // Quẻ số 63: Thủy Hỏa Ký Tế
  63: {
    hexagramNumber: 63,
    hexagramName: 'Thủy Hỏa Ký Tế',
    sinoVietnameseName: 'Thủy Hỏa Ký Tế',
    chineseName: '水火既濟',
    source: SOURCE_REF,
    version: CLASSICAL_TEXT_VERSION,
    thuanTu: {
      chinese: '既濟：亨小，利貞，初吉終亂。',
      sinoVietnamese: 'Ký Tế: Hanh tiểu, lợi trinh, sơ cát chung loạn.',
      translation: 'Quẻ Ký Tế: Hanh thông việc nhỏ, lợi về sự chính bền, ban đầu tốt lành cuối cùng rối loạn.',
      modernExplanation:
        'Sự việc đã hoàn tất, mọi hào đều đắc vị (âm hào âm, dương hào dương). Cảnh báo khi thành công đã viên mãn rất dễ sinh tâm lý chủ quan buông lỏng mà dẫn tới suy vi rối loạn.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    daiTuong: {
      chinese: '水在火上，既濟。君子以思患而預防之。',
      sinoVietnamese: 'Thủy tại hỏa thượng, Ký tế. Quân tử dĩ tư hoạn nhi dự phòng chi.',
      translation: 'Nước ở trên lửa là quẻ Ký Tế. Người quân tử suy nghĩ lo toan trước tai họa mà dự phòng ngăn chặn.',
      modernExplanation: 'Lo trước cái lo của thiên hạ, lúc bình yên phải biết phòng ngừa bất trắc khi biến cố ập đến.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    lines: [],
  },

  // Quẻ số 64: Hỏa Thủy Vị Tế
  64: {
    hexagramNumber: 64,
    hexagramName: 'Hỏa Thủy Vị Tế',
    sinoVietnameseName: 'Hỏa Thủy Vị Tế',
    chineseName: '火水未濟',
    source: SOURCE_REF,
    version: CLASSICAL_TEXT_VERSION,
    thuanTu: {
      chinese: '未濟：亨，小狐汔濟，濡其尾，無攸利。',
      sinoVietnamese: 'Vị Tế: Hanh, tiểu hồ hất tế, nhu kỳ vĩ, vô du lợi.',
      translation: 'Quẻ Vị Tế: Hanh thông, cáo con sắp qua sông ướt cái đuôi, không có gì lợi.',
      modernExplanation:
        'Sự việc chưa hoàn tất, còn dở dang nhưng chứa đựng tiềm năng mở ra chu kỳ phát triển mới. Cần kiên nhẫn và cẩn trọng đến tận phút chót, tránh non nớt mà hỏng việc.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    daiTuong: {
      chinese: '火在水上，未濟。君子以慎辨物居方。',
      sinoVietnamese: 'Hỏa tại thủy thượng, Vị tế. Quân tử dĩ thận biện vật cư phương.',
      translation: 'Lửa ở trên nước là quẻ Vị Tế. Người quân tử cẩn thận phân biệt tính chất muôn vật và xếp đặt đúng vị trí thích hợp.',
      modernExplanation: 'Cần tỉnh táo nhìn nhận rõ bản chất của từng sự vật, con người để đặt vào đúng vị trí thích đáng.',
      source: SOURCE_REF,
      version: CLASSICAL_TEXT_VERSION,
    },
    lines: [],
  },
};

/**
 * Tra cứu văn bản kinh điển Chu Dịch chuẩn tắc theo số thứ tự quẻ (1 đến 64)
 * Nếu chưa có dữ liệu nguyên bản đã kiểm chứng, trả về thông báo rõ ràng, tuyệt đối không bịa đặt.
 */
export function getClassicalHexagramData(hexagramNumber: number): ClassicalLookupResult {
  const data = VERIFIED_CLASSICAL_HEXAGRAMS[hexagramNumber];
  if (!data) {
    return {
      status: 'MISSING',
      hexagramNumber,
      message: `Chưa có dữ liệu nguyên văn cổ điển đã kiểm chứng cho quẻ số ${hexagramNumber}. Hệ thống Bắc Hà Tân An Phái tuân thủ nguyên tắc không tự bịa đặt hoặc gán nguồn không xác thực.`,
      hasVerifiedContent: false,
    };
  }

  return {
    status: 'AVAILABLE',
    data,
    hasVerifiedContent: true,
  };
}
