import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  QrCode, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  CreditCard, 
  ShieldCheck,
  AlertCircle,
  Wallet,
  Globe,
  Lock
} from 'lucide-react';
import api from '../../api/api';
import Navbar from '../../components/Navbar';

const PaymentGateway = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('order_id');
  const amount = Number(searchParams.get('amount') || 0);

  // FE8: Guard against missing params — redirect if no order_id or amount
  useEffect(() => {
    if (!orderId || !amount || amount <= 0) {
      navigate('/orders');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer: 10 minutes (600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedAmt, setCopiedAmt] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Simulation states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);

  // OTP Popup states
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Multi-method selection
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' | 'atm' | 'card'
  const [selectedAtmBank, setSelectedAtmBank] = useState('vcb'); // 'vcb' | 'tcb' | 'acb' | 'bidv'

  // ATM domestic card form states
  const [atmNumber, setAtmNumber] = useState('');
  const [atmName, setAtmName] = useState('');
  const [atmExpiry, setAtmExpiry] = useState('');

  // Visa card form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Verification steps messages
  const verifySteps = [
    'Đang kết nối cổng đối soát ngân hàng...',
    'Đang xác minh thông tin chủ thẻ và số dư...',
    'Đang xác thực mã OTP giao dịch...',
    'Giao dịch hợp lệ! Đang đồng bộ hóa trạng thái đơn hàng...',
  ];

  // Store's single payment destination (MB Bank)
  const storeAccount = {
    bankName: 'MB Bank (Ngân hàng Quân Đội)',
    accountNo: '0348582531',
    accountName: 'TRUONG MINH TRANG',
    qrCode: `https://img.vietqr.io/image/MB-0348582531-print.png?amount=${amount}&addInfo=SCARLETT%20${orderId}&accountName=TRUONG%20MINH%20TRANG`
  };

  // Domestic customer ATM banks selection
  const customerAtmBanks = {
    vcb: { name: 'Vietcombank', logo: 'VCB' },
    tcb: { name: 'Techcombank', logo: 'TCB' },
    acb: { name: 'ACB', logo: 'ACB' },
    bidv: { name: 'BIDV', logo: 'BIDV' },
    vtb: { name: 'VietinBank', logo: 'VTB' },
    agri: { name: 'Agribank', logo: 'AGR' }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (!isVerifying) return;
    if (verifyStep >= verifySteps.length) {
      handleConfirmBackend();
      return;
    }

    const timer = setTimeout(() => {
      setVerifyStep((prev) => prev + 1);
    }, 850);

    return () => clearTimeout(timer);
  }, [isVerifying, verifyStep]);

  useEffect(() => {
    if (!isSuccess) return;
    if (redirectCount <= 0) {
      navigate('/orders');
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCount((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isSuccess, redirectCount, navigate]);

  const handleConfirmBackend = async () => {
    try {
      // FE: Use /simulate-confirm for customer-initiated sandbox payment confirmation
      await api.post('/payments/simulate-confirm', { order_id: Number(orderId) });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.');
      setIsVerifying(false);
      setVerifyStep(0);
    }
  };

  // FE10: Wrap clipboard.writeText in try/catch — browser may deny in non-HTTPS
  const handleCopy = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 1500);
    } catch {
      alert('Không thể sao chép. Vui lòng sao chép thủ công.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleAtmNumberChange = (e) => {
    setAtmNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardExpiry(value.substring(0, 5));
  };

  const handleAtmExpiryChange = (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setAtmExpiry(value.substring(0, 5));
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    setCardCvv(value.substring(0, 4));
  };

  const triggerOtpRequest = (e) => {
    e.preventDefault();
    setOtpInput('');
    setOtpError('');
    setShowOtpPopup(true);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otpInput === '123456') {
      setShowOtpPopup(false);
      setIsVerifying(true);
    } else {
      setOtpError('Mã OTP không chính xác. Vui lòng nhập đúng mã OTP giả lập là 123456');
    }
  };

  const formattedAmount = amount.toLocaleString('vi-VN');
  const transferMsg = `SCARLETT ${orderId}`;

  return (
    <div style={styles.page}>
      <Navbar />
      
      {/* OTP Verification Modal */}
      {showOtpPopup && (
        <div style={styles.overlay}>
          <div style={styles.otpCard}>
            <div style={styles.otpIconContainer}>
              <Lock size={28} style={{ color: '#6b1111' }} />
            </div>
            <h3 style={styles.otpTitle}>Xác thực OTP giao dịch</h3>
            <p style={styles.otpDesc}>
              Một mã OTP giả lập gồm 6 chữ số đã được gửi qua tin nhắn SMS đến số điện thoại liên kết của bạn.
            </p>
            
            <div style={styles.otpHelpBox}>
              💡 Nhập mã OTP giả lập là: <strong style={{ color: '#6b1111' }}>123456</strong> để tiếp tục thử nghiệm.
            </div>

            <form onSubmit={handleOtpSubmit} style={{ width: '100%' }}>
              <input 
                type="text" 
                maxLength={6}
                placeholder="Nhập mã OTP 6 số"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                style={styles.otpInput}
                autoFocus
                required
              />

              {otpError && <div style={styles.otpErrorMsg}>{otpError}</div>}

              <div style={styles.otpActions}>
                <button 
                  type="button" 
                  onClick={() => setShowOtpPopup(false)}
                  style={styles.otpCancelBtn}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  style={styles.otpConfirmBtn}
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Process Overlay */}
      {isVerifying && !isSuccess && (
        <div style={styles.overlay}>
          <div style={styles.loaderCard}>
            <div style={styles.spinner}></div>
            <h3 style={styles.loaderTitle}>Đang xác thực giao dịch</h3>
            <p style={styles.loaderStatus}>{verifySteps[verifyStep] || 'Đang hoàn tất...'}</p>
            <div style={styles.progressBarBg}>
              <div style={{
                ...styles.progressBarFill,
                width: `${((verifyStep + 1) / verifySteps.length) * 100}%`
              }} />
            </div>
            <div style={styles.sandboxLabelBox}>
              <Sparkles size={14} style={{ color: '#b89a5b', marginRight: '5px' }} />
              <span style={styles.sandboxLabel}>Hệ thống đối soát tự động của Scarlett Cake Shop</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Screen Overlay */}
      {isSuccess && (
        <div style={styles.overlay}>
          <div style={styles.successCard}>
            <div style={styles.successCircle}>
              <svg style={styles.successCheck} viewBox="0 0 52 52">
                <circle style={styles.successCircleStroke} cx="26" cy="26" r="25" fill="none" />
                <path style={styles.successCheckStroke} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h2 style={styles.successTitle}>Thanh toán thành công!</h2>
            <p style={styles.successDesc}>Chúng tôi đã nhận được khoản thanh toán cho đơn hàng #{orderId}. Cảm ơn quý khách!</p>
            
            <div style={styles.successDetailBox}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Mã đơn hàng:</span>
                <strong style={styles.detailValue}>#{orderId}</strong>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Số tiền đã nhận:</span>
                <strong style={styles.detailValueHighlight}>{formattedAmount} đ</strong>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Trạng thái đơn hàng:</span>
                <span style={styles.confirmedBadge}>CONFIRMED</span>
              </div>
            </div>
            <p style={styles.redirectText}>Tự động chuyển hướng về lịch sử đơn hàng sau <strong>{redirectCount}</strong> giây...</p>
          </div>
        </div>
      )}

      <main style={styles.container}>
        {/* Breadcrumb path */}
        <div style={styles.breadcrumb}>
          <span>Cửa hàng</span> &nbsp;›&nbsp; <span>Giỏ hàng</span> &nbsp;›&nbsp; <span>Thanh toán</span> &nbsp;›&nbsp; <span style={{ color: '#6b1111', fontWeight: '700' }}>Cổng Thanh Toán Trực Tuyến</span>
        </div>

        <div style={styles.header}>
          <h2 style={styles.pageTitle}>Cổng Thanh Toán Scarlett</h2>
          <div style={styles.underline}></div>
          <p style={styles.subtitle}>
            Vui lòng chọn hình thức thanh toán mong muốn dưới đây để hoàn tất thủ tục thanh toán trực tuyến.
          </p>
        </div>

        {/* Tab Selector */}
        <div style={styles.tabsContainer}>
          <button 
            onClick={() => setActiveTab('bank')}
            style={{...styles.tabBtn, ...(activeTab === 'bank' ? styles.tabBtnActive : {})}}
          >
            <QrCode size={16} style={{ marginRight: '8px' }} />
            Chuyển khoản VietQR
          </button>
          <button 
            onClick={() => setActiveTab('atm')}
            style={{...styles.tabBtn, ...(activeTab === 'atm' ? styles.tabBtnActive : {})}}
          >
            <CreditCard size={16} style={{ marginRight: '8px' }} />
            Thẻ ATM nội địa
          </button>
          <button 
            onClick={() => setActiveTab('card')}
            style={{...styles.tabBtn, ...(activeTab === 'card' ? styles.tabBtnActive : {})}}
          >
            <Globe size={16} style={{ marginRight: '8px' }} />
            Thẻ quốc tế (Visa/Master)
          </button>
        </div>

        {/* Info Alert Box (Only show when not in Card Tab) */}
        {activeTab === 'bank' && (
          <div style={styles.alertBox}>
            <AlertCircle size={20} style={{ color: '#b89a5b', marginRight: '12px', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#5c1111', display: 'block', marginBottom: '3px' }}>Chế độ quét mã QR thử nghiệm</strong>
              <span style={{ fontSize: '0.88rem', color: '#555' }}>
                Quý khách có thể quét mã QR bên phải (thông tin điền sẵn, không cần gửi tiền thực tế), sau đó nhấn nút <strong>"Xác nhận đã chuyển tiền"</strong> bên dưới để hoàn tất giả lập.
              </span>
            </div>
          </div>
        )}

        {activeTab === 'atm' && (
          <div style={styles.alertBox}>
            <AlertCircle size={20} style={{ color: '#b89a5b', marginRight: '12px', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#5c1111', display: 'block', marginBottom: '3px' }}>Giả lập thanh toán thẻ nội địa (ATM)</strong>
              <span style={{ fontSize: '0.88rem', color: '#555' }}>
                Nhập thông tin thẻ ATM của quý khách (ví dụ Vietcombank, Techcombank...). Hệ thống chỉ xử lý giả lập, bảo đảm an toàn dữ liệu 100%.
              </span>
            </div>
          </div>
        )}

        <div style={styles.layout}>
          {/* LEFT CONTENT */}
          <section style={styles.card}>
            {activeTab === 'bank' && (
              <>
                <div style={styles.cardHeader}>
                  <QrCode size={18} style={{ color: '#6b1111', marginRight: '10px' }} />
                  <h3 style={styles.cardTitle}>Thông tin tài khoản nhận của cửa hàng</h3>
                </div>

                <div style={styles.infoList}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Ngân hàng nhận</div>
                    <div style={styles.infoValueRow}>
                      <span style={styles.infoValue}>{storeAccount.bankName}</span>
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Số tài khoản</div>
                    <div style={styles.infoValueRow}>
                      <span style={styles.infoValueBold}>{storeAccount.accountNo}</span>
                      <button 
                        onClick={() => handleCopy(storeAccount.accountNo, setCopiedAcc)}
                        style={copiedAcc ? styles.copiedBtn : styles.copyBtn}
                      >
                        {copiedAcc ? <Check size={13} style={{ marginRight: '3px' }} /> : <Copy size={13} style={{ marginRight: '3px' }} />}
                        {copiedAcc ? 'Đã chép!' : 'Sao chép'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Chủ tài khoản</div>
                    <div style={styles.infoValueRow}>
                      <span style={styles.infoValue}>{storeAccount.accountName}</span>
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Số tiền cần thanh toán</div>
                    <div style={styles.infoValueRow}>
                      <span style={styles.infoPrice}>{formattedAmount} đ</span>
                      <button 
                        onClick={() => handleCopy(amount.toString(), setCopiedAmt)}
                        style={copiedAmt ? styles.copiedBtn : styles.copyBtn}
                      >
                        {copiedAmt ? <Check size={13} style={{ marginRight: '3px' }} /> : <Copy size={13} style={{ marginRight: '3px' }} />}
                        {copiedAmt ? 'Đã chép!' : 'Sao chép'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Nội dung chuyển khoản (Ghi chính xác)</div>
                    <div style={styles.infoValueRowHighlight}>
                      <span style={styles.infoMsg}>{transferMsg}</span>
                      <button 
                        onClick={() => handleCopy(transferMsg, setCopiedMsg)}
                        style={copiedMsg ? styles.copiedBtnHighlight : styles.copyBtnHighlight}
                      >
                        {copiedMsg ? <Check size={13} style={{ marginRight: '3px' }} /> : <Copy size={13} style={{ marginRight: '3px' }} />}
                        {copiedMsg ? 'Đã chép!' : 'Sao chép nội dung'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'atm' && (
              <>
                <div style={styles.cardHeader}>
                  <CreditCard size={18} style={{ color: '#6b1111', marginRight: '10px' }} />
                  <h3 style={styles.cardTitle}>Chọn ngân hàng phát hành thẻ của khách</h3>
                </div>

                {/* ATM Bank Pills Grid */}
                <div style={styles.bankPillsGrid}>
                  {Object.keys(customerAtmBanks).map((key) => {
                    const bank = customerAtmBanks[key];
                    const isSelected = selectedAtmBank === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedAtmBank(key)}
                        style={{
                          ...styles.bankPill,
                          borderColor: isSelected ? '#6b1111' : '#eee',
                          backgroundColor: isSelected ? '#fffdfb' : '#fff',
                          boxShadow: isSelected ? '0 4px 12px rgba(107, 17, 17, 0.08)' : 'none',
                        }}
                      >
                        <span style={{...styles.bankPillName, color: isSelected ? '#6b1111' : '#444'}}>{bank.name}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={triggerOtpRequest} style={styles.cardForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabelText}>Số Thẻ / Số Tài Khoản ATM</label>
                    <input 
                      type="text" 
                      placeholder="9704 2222 3333 4444"
                      value={atmNumber}
                      onChange={handleAtmNumberChange}
                      style={styles.formInput}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabelText}>Họ Tên Chủ Thẻ (Không Dấu)</label>
                    <input 
                      type="text" 
                      placeholder="NGUYEN VAN A"
                      value={atmName}
                      onChange={(e) => setAtmName(e.target.value.toUpperCase())}
                      style={styles.formInput}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabelText}>Ngày Phát Hành (Tháng/Năm - MM/YY)</label>
                    <input 
                      type="text" 
                      placeholder="09/25"
                      value={atmExpiry}
                      onChange={handleAtmExpiryChange}
                      style={styles.formInput}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' }}>
                    <span style={{ fontSize: '0.88rem', color: '#888' }}>Số tiền giao dịch:</span>
                    <strong style={{ fontSize: '1.2rem', color: '#6b1111' }}>{formattedAmount} đ</strong>
                  </div>

                  <button type="submit" style={styles.confirmBtnCard}>
                    <ShieldCheck size={18} style={{ marginRight: '8px' }} />
                    TIẾP TỤC ĐỂ NHẬN OTP
                  </button>
                </form>
              </>
            )}

            {activeTab === 'card' && (
              <>
                <div style={styles.cardHeader}>
                  <Globe size={18} style={{ color: '#6b1111', marginRight: '10px' }} />
                  <h3 style={styles.cardTitle}>Nhập thông tin thẻ quốc tế của khách</h3>
                </div>

                <form onSubmit={triggerOtpRequest} style={styles.cardForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabelText}>Số Thẻ Visa/Mastercard</label>
                    <input 
                      type="text" 
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      style={styles.formInput}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabelText}>Tên Trên Thẻ (Cardholder Name)</label>
                    <input 
                      type="text" 
                      placeholder="NGUYEN VAN A"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      style={styles.formInput}
                      required
                    />
                  </div>

                  <div style={styles.formRowGroup}>
                    <div style={{...styles.formGroup, flex: 1}}>
                      <label style={styles.formLabelText}>Hạn Dùng (MM/YY)</label>
                      <input 
                        type="text" 
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        style={styles.formInput}
                        required
                      />
                    </div>
                    <div style={{...styles.formGroup, flex: 1}}>
                      <label style={styles.formLabelText}>Mã CVV</label>
                      <input 
                        type="password" 
                        placeholder="•••"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        style={styles.formInput}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' }}>
                    <span style={{ fontSize: '0.88rem', color: '#888' }}>Số tiền giao dịch:</span>
                    <strong style={{ fontSize: '1.2rem', color: '#6b1111' }}>{formattedAmount} đ</strong>
                  </div>

                  <button type="submit" style={styles.confirmBtnCard}>
                    <ShieldCheck size={18} style={{ marginRight: '8px' }} />
                    TIẾP TỤC ĐỂ NHẬN OTP
                  </button>
                </form>
              </>
            )}

            {activeTab === 'bank' && (
              <div style={styles.timerContainer}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Clock size={16} style={{ color: '#6b1111', marginRight: '8px' }} />
                  <span style={styles.timerLabel}>Giao dịch tự động hết hạn sau:</span>
                </div>
                <span style={timeLeft < 60 ? styles.timerValueUrgent : styles.timerValue}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </section>

          {/* RIGHT SIDEBAR */}
          <section style={styles.cardCenter}>
            {activeTab === 'bank' && (
              <>
                <div style={styles.cardHeaderCenter}>
                  <QrCode size={18} style={{ color: '#6b1111', marginRight: '10px' }} />
                  <h3 style={styles.cardTitleCenter}>Mã QR quét thanh toán duy nhất</h3>
                </div>
                
                <div style={styles.qrWrapper}>
                  {/* Decorative Borders */}
                  <div style={{...styles.qrCorner, top: -1, left: -1, borderTop: '3px solid #b89a5b', borderLeft: '3px solid #b89a5b'}} />
                  <div style={{...styles.qrCorner, top: -1, right: -1, borderTop: '3px solid #b89a5b', borderRight: '3px solid #b89a5b'}} />
                  <div style={{...styles.qrCorner, bottom: -1, left: -1, borderBottom: '3px solid #b89a5b', borderLeft: '3px solid #b89a5b'}} />
                  <div style={{...styles.qrCorner, bottom: -1, right: -1, borderBottom: '3px solid #b89a5b', borderRight: '3px solid #b89a5b'}} />
                  
                   <img 
                    src={storeAccount.qrCode} 
                    alt="Mã QR MB Bank Scarlett Bakery" 
                    style={styles.qrImage}
                    onError={(e) => {
                      e.target.onerror = null;
                      // FE11: via.placeholder.com is defunct — use inline SVG data URI
                      e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='230' height='230' viewBox='0 0 230 230'><rect width='230' height='230' fill='%23f8f8f8'/><text x='115' y='100' text-anchor='middle' fill='%23999' font-size='14' font-family='sans-serif'>QR Code</text><text x='115' y='125' text-anchor='middle' fill='%23999' font-size='12' font-family='sans-serif'>Đang tải...</text></svg>";
                    }}
                  />
                </div>
                <p style={styles.qrHint}>
                  Mở camera hoặc ứng dụng chuyển tiền của quý khách quét mã này để tự động điền thông tin chuyển tiền về MB Bank cửa hàng.
                </p>
              </>
            )}

            {activeTab === 'atm' && (
              <>
                <div style={styles.cardHeaderCenter}>
                  <Sparkles size={18} style={{ color: '#6b1111', marginRight: '10px' }} />
                  <h3 style={styles.cardTitleCenter}>Xem trước thẻ ATM nội địa</h3>
                </div>

                {/* Premium Domestic ATM Card Mockup */}
                <div style={{...styles.creditCardMock, background: 'linear-gradient(135deg, #102a43 0%, #243b53 50%, #486581 100%)'}}>
                  <div style={styles.creditCardInner}>
                    <div style={styles.cardTopRow}>
                      <div style={styles.cardChip}></div>
                      <span style={styles.cardBrand}>{customerAtmBanks[selectedAtmBank].name}</span>
                    </div>
                    <div style={styles.cardNumberText}>
                      {atmNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div style={styles.cardBottomRow}>
                      <div style={styles.cardHolder}>
                        <span style={styles.cardMockLabel}>CARD HOLDER</span>
                        <span style={styles.cardMockValue}>{atmName || 'NGUYEN VAN A'}</span>
                      </div>
                      <div style={styles.cardExpiryMock}>
                        <span style={styles.cardMockLabel}>ISSUED DATE</span>
                        <span style={styles.cardMockValue}>{atmExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#faf9f6', borderRadius: '8px', border: '1px solid #f1ece6', textAlign: 'left', fontSize: '0.82rem', color: '#666', lineHeight: '1.5' }}>
                  🔒 <strong>Giao dịch qua ATM:</strong> Hệ thống tự động liên kết thẻ ATM nội địa của khách hàng để xử lý thanh toán thông qua giả lập Sandbox.
                </div>
              </>
            )}

            {activeTab === 'card' && (
              <>
                <div style={styles.cardHeaderCenter}>
                  <Sparkles size={18} style={{ color: '#6b1111', marginRight: '10px' }} />
                  <h3 style={styles.cardTitleCenter}>Xem trước thẻ Visa/Master</h3>
                </div>

                {/* Premium Glassmorphism Credit Card Mockup */}
                <div style={styles.creditCardMock}>
                  <div style={styles.creditCardInner}>
                    <div style={styles.cardTopRow}>
                      <div style={styles.cardChip}></div>
                      <span style={styles.cardBrand}>VISA</span>
                    </div>
                    <div style={styles.cardNumberText}>
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div style={styles.cardBottomRow}>
                      <div style={styles.cardHolder}>
                        <span style={styles.cardMockLabel}>CARD HOLDER</span>
                        <span style={styles.cardMockValue}>{cardName || 'NGUYEN VAN A'}</span>
                      </div>
                      <div style={styles.cardExpiryMock}>
                        <span style={styles.cardMockLabel}>EXPIRES</span>
                        <span style={styles.cardMockValue}>{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#faf9f6', borderRadius: '8px', border: '1px solid #f1ece6', textAlign: 'left', fontSize: '0.82rem', color: '#666', lineHeight: '1.5' }}>
                  🔒 <strong>Thanh toán bảo mật:</strong> Hệ thống xử lý thông tin thẻ quốc tế an toàn của khách hàng dựa trên giao thức mã hóa giả lập Sandbox.
                </div>
              </>
            )}
          </section>
        </div>

        {/* ACTIONS */}
        <div style={styles.actionSection}>
          {activeTab === 'bank' && (
            <button 
              onClick={() => setIsVerifying(true)}
              disabled={isVerifying || timeLeft <= 0}
              style={{
                ...styles.confirmBtn,
                opacity: (isVerifying || timeLeft <= 0) ? 0.6 : 1,
                cursor: (isVerifying || timeLeft <= 0) ? 'not-allowed' : 'pointer',
              }}
            >
              <ShieldCheck size={18} style={{ marginRight: '8px' }} />
              {timeLeft <= 0 ? 'PHIÊN GIAO DỊCH ĐÃ HẾT HẠN' : 'XÁC NHẬN ĐÃ CHUYỂN TIỀN (GIẢ LẬP THANH TOÁN)'}
            </button>
          )}
          
          <button 
            onClick={() => navigate('/orders')} 
            style={styles.cancelBtn}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Quay lại trang đơn hàng của tôi
          </button>
        </div>
      </main>

      {/* Embedded CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes drawCheck {
          0% { stroke-dashoffset: 48; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes drawCircle {
          0% { stroke-dashoffset: 157; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulseAlert {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}} />
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#fdfcfb', // Cream soft white
    minHeight: '100vh',
    fontFamily: "'Montserrat', sans-serif",
    color: '#5c5464',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '30px 20px 80px',
    boxSizing: 'border-box',
  },
  breadcrumb: {
    fontSize: '0.82rem',
    color: '#9e95a5',
    textAlign: 'left',
    marginBottom: '30px',
    letterSpacing: '0.5px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '35px',
  },
  sandboxBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #c88959, #b89a5b)',
    color: '#fff',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: '20px',
    letterSpacing: '1px',
    marginBottom: '12px',
    boxShadow: '0 4px 10px rgba(184, 154, 91, 0.25)',
  },
  pageTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.5rem',
    color: '#390909', // Deep dark burgundy
    margin: 0,
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  underline: {
    width: '60px',
    height: '3px',
    backgroundColor: '#6b1111', // Bordeaux red
    margin: '15px auto 20px',
    borderRadius: '1.5px',
  },
  subtitle: {
    fontSize: '0.98rem',
    color: '#847a8a',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  tabsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '35px',
    borderBottom: '1px solid #f1ece6',
    paddingBottom: '15px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: '1px solid #dcd5cc',
    borderRadius: '30px',
    color: '#666',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  tabBtnActive: {
    backgroundColor: '#6b1111',
    color: '#fff',
    borderColor: '#6b1111',
    boxShadow: '0 4px 15px rgba(107, 17, 17, 0.15)',
  },
  alertBox: {
    display: 'flex',
    alignItems: 'flex-start',
    backgroundColor: '#faf6f0', // soft golden cream
    borderLeft: '4px solid #b89a5b', // gold
    padding: '18px 22px',
    borderRadius: '0 12px 12px 0',
    marginBottom: '35px',
    textAlign: 'left',
    boxShadow: '0 4px 12px rgba(184, 154, 91, 0.05)',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '35px',
    alignItems: 'stretch',
    marginBottom: '45px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #f1ece6',
    padding: '35px',
    boxShadow: '0 10px 35px rgba(57, 9, 9, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'left',
  },
  cardCenter: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #f1ece6',
    padding: '35px',
    boxShadow: '0 10px 35px rgba(57, 9, 9, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #f8f6f2',
    paddingBottom: '15px',
    marginBottom: '25px',
    width: '100%',
  },
  cardHeaderCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #f8f6f2',
    paddingBottom: '15px',
    marginBottom: '25px',
    width: '100%',
  },
  cardTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.25rem',
    color: '#390909',
    margin: 0,
    fontWeight: '700',
  },
  cardTitleCenter: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.25rem',
    color: '#390909',
    margin: 0,
    fontWeight: '700',
  },
  bankPillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
    marginBottom: '25px',
    width: '100%',
  },
  bankPill: {
    padding: '10px 4px',
    border: '1px solid #eee',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    outline: 'none',
  },
  bankPillName: {
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.3px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    width: '100%',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  infoLabel: {
    fontSize: '0.8rem',
    color: '#a399aa',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  infoValueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: '#faf9f6',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #f5f1ea',
  },
  infoValueRowHighlight: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: '#fff7f7', // light bordeaux tint
    padding: '14px 18px',
    borderRadius: '8px',
    border: '1px solid #ffd8d8',
  },
  infoValue: {
    fontSize: '0.95rem',
    color: '#390909',
    fontWeight: '600',
  },
  infoValueBold: {
    fontSize: '1.08rem',
    color: '#390909',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  infoPrice: {
    fontSize: '1.2rem',
    color: '#6b1111',
    fontWeight: '800',
  },
  infoMsg: {
    fontSize: '1.15rem',
    color: '#6b1111',
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#faf6f0',
    color: '#b89a5b',
    border: '1px solid #e5d8c3',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  copyBtnHighlight: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 4px 10px rgba(107, 17, 17, 0.15)',
  },
  copiedBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'default',
  },
  copiedBtnHighlight: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'default',
  },
  timerContainer: {
    marginTop: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff9f9',
    border: '1px solid #ffe3e3',
    borderRadius: '10px',
    padding: '12px 18px',
  },
  timerLabel: {
    fontSize: '0.88rem',
    color: '#847a8a',
    fontWeight: '600',
  },
  timerValue: {
    fontSize: '1.15rem',
    color: '#6b1111',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  timerValueUrgent: {
    fontSize: '1.15rem',
    color: '#e11d48',
    fontWeight: '700',
    fontFamily: 'monospace',
    animation: 'pulseAlert 0.8s infinite alternate',
  },
  qrWrapper: {
    backgroundColor: '#fff',
    border: '1px solid #f5eee5',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(57, 9, 9, 0.02)',
    marginBottom: '20px',
    position: 'relative',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCorner: {
    position: 'absolute',
    width: '18px',
    height: '18px',
  },
  qrImage: {
    width: '230px',
    height: '230px',
    objectFit: 'contain',
    display: 'block',
  },
  qrHint: {
    fontSize: '0.85rem',
    color: '#847a8a',
    lineHeight: '1.6',
    margin: 0,
    maxWidth: '280px',
  },
  
  // Card Form Styles
  cardForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formRowGroup: {
    display: 'flex',
    gap: '16px',
  },
  formLabelText: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#847a8a',
    letterSpacing: '0.5px',
  },
  formInput: {
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid #dcd5cc',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    color: '#333',
    backgroundColor: '#fdfbfa',
    '&:focus': {
      borderColor: '#6b1111',
    }
  },

  // Premium Credit Card Mockup Styles
  creditCardMock: {
    width: '100%',
    maxWidth: '320px',
    height: '190px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #4c0505 0%, #1f0202 50%, #6b1111 100%)',
    boxShadow: '0 15px 30px rgba(107, 17, 17, 0.25)',
    padding: '24px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  creditCardInner: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChip: {
    width: '40px',
    height: '30px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #e5c07b 0%, #b89a5b 100%)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  cardBrand: {
    fontSize: '1.25rem',
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: '1px',
    color: '#fff',
  },
  cardNumberText: {
    fontSize: '1.15rem',
    fontFamily: 'monospace',
    letterSpacing: '2.5px',
    textAlign: 'center',
    margin: '18px 0',
    color: '#fff',
  },
  cardBottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolder: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    maxWidth: '180px',
  },
  cardExpiryMock: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
  },
  cardMockLabel: {
    fontSize: '0.62rem',
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginBottom: '2px',
  },
  cardMockValue: {
    fontSize: '0.82rem',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    marginTop: '15px',
  },
  confirmBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '18px 40px',
    fontSize: '0.98rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 8px 24px rgba(107, 17, 17, 0.25)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    outline: 'none',
  },
  confirmBtnCard: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px 20px',
    fontSize: '0.92rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 6px 18px rgba(107, 17, 17, 0.15)',
    transition: 'all 0.3s ease',
    outline: 'none',
    marginTop: '5px',
  },
  cancelBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: '#847a8a',
    border: '1px solid #dcd5cc',
    borderRadius: '10px',
    padding: '14px 30px',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '520px',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  
  // Overlay & Modal Styles
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(57, 9, 9, 0.82)', // Burgurdy tinted backdrop
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backdropFilter: 'blur(10px)',
  },
  loaderCard: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '45px 35px',
    width: '100%',
    maxWidth: '440px',
    textAlign: 'center',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #f1ece6',
  },
  spinner: {
    width: '56px',
    height: '56px',
    border: '4px solid #faf6f0',
    borderTop: '4px solid #6b1111',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '25px',
  },
  loaderTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.55rem',
    color: '#390909',
    margin: '0 0 12px 0',
    fontWeight: '700',
  },
  loaderStatus: {
    fontSize: '0.95rem',
    color: '#847a8a',
    marginBottom: '25px',
    minHeight: '22px',
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: '#f3f4f6',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '22px',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6b1111',
    borderRadius: '999px',
    transition: 'width 0.4s ease-out',
  },
  sandboxLabelBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sandboxLabel: {
    fontSize: '0.78rem',
    color: '#a399aa',
    fontWeight: '600',
  },
  
  // Success Card Styles
  successCard: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '50px 40px',
    width: '100%',
    maxWidth: '480px',
    textAlign: 'center',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #f1ece6',
    animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  successCircle: {
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '25px',
  },
  successCheck: {
    width: '52px',
    height: '52px',
  },
  successCircleStroke: {
    stroke: '#10b981',
    strokeWidth: 2,
    strokeDasharray: 157,
    strokeDashoffset: 157,
    animation: 'drawCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards 0.2s',
  },
  successCheckStroke: {
    stroke: '#10b981',
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDasharray: 48,
    strokeDashoffset: 48,
    animation: 'drawCheck 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards 0.8s',
  },
  successTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.9rem',
    color: '#059669',
    margin: '0 0 12px 0',
    fontWeight: '700',
  },
  successDesc: {
    fontSize: '0.96rem',
    color: '#847a8a',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  successDetailBox: {
    width: '100%',
    backgroundColor: '#faf9f6',
    border: '1px solid #f1ece6',
    borderRadius: '12px',
    padding: '18px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '30px',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: '0.88rem',
    color: '#847a8a',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '0.92rem',
    color: '#390909',
    fontWeight: '700',
  },
  detailValueHighlight: {
    fontSize: '1.1rem',
    color: '#6b1111',
    fontWeight: '800',
  },
  confirmedBadge: {
    backgroundColor: '#ecfdf5',
    color: '#059669',
    fontSize: '0.78rem',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '6px',
    border: '1px solid #10b981',
  },
  redirectText: {
    fontSize: '0.88rem',
    color: '#a399aa',
    margin: 0,
  },

  // OTP Popup Specific Styles
  otpCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '40px 30px',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 25px 55px rgba(0, 0, 0, 0.3)',
    border: '1px solid #efe5de',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  otpIconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#fbf5f5',
    border: '1px solid #e8cccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  otpTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.45rem',
    color: '#390909',
    margin: '0 0 10px 0',
    fontWeight: '700',
  },
  otpDesc: {
    fontSize: '0.88rem',
    color: '#666',
    lineHeight: '1.5',
    margin: '0 0 20px 0',
  },
  otpHelpBox: {
    fontSize: '0.8rem',
    backgroundColor: '#faf6f0',
    border: '1px solid #e5d8c3',
    color: '#666',
    padding: '10px 14px',
    borderRadius: '8px',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '20px',
  },
  otpInput: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #dcd5cc',
    fontSize: '1.25rem',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '5px',
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '15px',
    color: '#333',
    backgroundColor: '#fdfbfa',
    '&:focus': {
      borderColor: '#6b1111',
    }
  },
  otpErrorMsg: {
    color: '#c5221f',
    fontSize: '0.82rem',
    marginBottom: '15px',
    fontWeight: '600',
    textAlign: 'center',
  },
  otpActions: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
  otpCancelBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#fff',
    color: '#847a8a',
    border: '1px solid #dcd5cc',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  otpConfirmBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};

export default PaymentGateway;
